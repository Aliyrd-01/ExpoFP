const AWS = require("aws-sdk");
const fs = require("fs");

const credentials = new AWS.SharedIniFileCredentials({ profile: "efp-deploy-fp" });
const s3 = new AWS.S3({ apiVersion: "2006-03-01", credentials });
var cloudfront = new AWS.CloudFront({ apiVersion: "2019-03-26", credentials });

// Purge URL example:
// https://purge.jsdelivr.net/npm/expofp2@1/dist/*
const publicPath = "https://cdn.jsdelivr.net/npm/expofp@0/dist/";
const expos = ["expo", "eventtechlive2019"];

console.log("Deploy to selected locations", publicPath, expos);

const template = fs.readFileSync(__dirname + "/template.html", "utf8");

(async function() {
    const invalidates = [];
    for (const expoName of expos) {
        console.log("Processing", expoName);

        const html = template.replace(/%PUBLIC_PATH%/g, publicPath).replace(/%EXPO_NAME%/g, expoName);

        const fileName = `expos/${expoName}/live/index2.html`;
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
