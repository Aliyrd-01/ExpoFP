const except = ["expo", "jtrade19"];
const minDaysUsed = 30;
const execa = require("execa");

// const execa = require("execa");
require("colors");
const AWS = require("aws-sdk");

const credentials = new AWS.SharedIniFileCredentials({ profile: "efp-deploy-fp" });
const s3 = new AWS.S3({ apiVersion: "2006-03-01", credentials });

(async function() {
    // Create the parameters for calling listObjects

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
        if (except.indexOf(r) !== -1) continue;
        const res = await s3
            .listObjects({ Bucket: "efp-data", Prefix: `${r}data/fp.svg.js`, Delimiter: "/", MaxKeys: 300 })
            .promise();
        const lastModified = res.Contents && res.Contents[0] && res.Contents[0].LastModified;
        console.log(r, lastModified, minDate);
        if (lastModified > minDate) {
            console.log("+");
            good.push(r.replace(/expos\/(.+)\//, "$1"));
        }
        // if (good.length > 1) break;
    }

    console.log("Good:", good);

    for (const expo of good) {
        const p = await execa("yarn", ["deploy", `--expo=${expo}`], { stdio: "inherit" });
        if (p.exitCode !== 0) process.exit(p.exitCode);
    }

    for (const expo of good) {
        console.log(`https://${expo}.expofp.com/`);
    }

    console.log("Done");
})();
