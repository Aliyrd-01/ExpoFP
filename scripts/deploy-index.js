const AWS = require("aws-sdk");
const fs = require("fs");

const credentials = new AWS.SharedIniFileCredentials({ profile: "efp-deploy-fp" });
const s3 = new AWS.S3({ apiVersion: "2006-03-01", credentials });

console.log("Deploy to selected locations");

// Purge URL example:
// https://purge.jsdelivr.net/npm/jquery@3.2.1/AUTHORS.txt
const publicPath = "https://cdn.jsdelivr.net/npm/expofp2@1/dist/";

const expos = ["expo"];

const template = fs.readFileSync(__dirname + "/template.html", "utf8");

(async function() {
    for (const expoName of expos) {
        console.log("Processing", expoName);

        const html = template.replace(/%PUBLIC_PATH%/g, publicPath).replace(/%EXPO_NAME%/g, expoName);

        const bucketParams = {
            Bucket: "efp-data",
            Key: `expos/${expoName}/live/index2.html`,
            Body: html,
            ContentType: "text/html"
        };

        await s3.putObject(bucketParams).promise();
    }
})();
