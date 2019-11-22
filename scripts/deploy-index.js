const AWS = require("aws-sdk");
const fs = require("fs");

const credentials = new AWS.SharedIniFileCredentials({ profile: "efp-deploy-fp" });
const s3 = new AWS.S3({ apiVersion: "2006-03-01", credentials });
var cloudfront = new AWS.CloudFront({ apiVersion: "2019-03-26", credentials });

// Purge URL example:
// https://purge.jsdelivr.net/npm/expofp2@1/dist/*
const publicPath = "https://cdn.jsdelivr.net/npm/expofp@0.0.4/dist/";
const expos = null; //["eventtechlive2020"];
const except = ["demo", "jtrade19", "_template_for_new_event_"];

console.log("Deploy to selected locations", publicPath, expos);

const template = fs.readFileSync(__dirname + "/template.html", "utf8");

(async function() {
    const taken = expos || (await getGoodExpos());
    console.log("Taken:", taken);

    return;
    const invalidates = [];
    for (const expoName of taken) {
        console.log("Processing", expoName);

        const html = template.replace(/%PUBLIC_PATH%/g, publicPath).replace(/%EXPO_NAME%/g, expoName);

        const fileName = `expos/${expoName}/live/index.html`;
        const bucketParams = {
            Bucket: "efp-data",
            Key: fileName,
            Body: html,
            ContentType: "text/html"
        };

        await s3.putObject(bucketParams).promise();

        invalidates.push(`/${fileName}`);
    }

    console.log("Doing invalidation...");

    const params = {
        DistributionId: "ETXR07B411G19",
        InvalidationBatch: {
            CallerReference: "DUMMY" + +new Date(),
            Paths: {
                Quantity: invalidates.length,
                Items: invalidates
            }
        }
    };
    await cloudfront.createInvalidation(params).promise();
})();

const minDaysUsed = 30;

async function getGoodExpos() {
    let continuationToken;
    const res = [];
    do {
        const bucketParams = {
            Bucket: "efp-data",
            Prefix: "expos/",
            Delimiter: "/",
            MaxKeys: 500,
            ContinuationToken: continuationToken
        };
        const res2 = await s3.listObjectsV2(bucketParams).promise();
        continuationToken = res2.NextContinuationToken;

        res.push(...res2.CommonPrefixes.map(obj => obj.Prefix));
        console.log("Success", res.length);
    } while (continuationToken);

    // console.log(res);

    const good = [];
    var ms = new Date().getTime() - minDaysUsed * 1000 * 60 * 60 * 24;
    var minDate = new Date(ms);
    console.log(minDate);
    for (const r of res) {
        const expo = r.replace(/expos\/(.+)\//, "$1");
        if (expo >= "b") continue;
        if (except.indexOf(expo) !== -1) continue;
        const res = await s3
            .listObjects({ Bucket: "efp-data", Prefix: `${r}data/fp.svg.js`, Delimiter: "/", MaxKeys: 300 })
            .promise();
        const lastModified = res.Contents && res.Contents[0] && res.Contents[0].LastModified;
        console.log(r, lastModified, minDate);
        if (lastModified > minDate) {
            console.log("+");
            good.push(expo);
        }
    }

    console.log("Good:", good);
    return good;
}
