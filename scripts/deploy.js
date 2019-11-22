const fs = require("fs");
const AWS = require("aws-sdk");

const stable = null;
const beta = "0.1.7";
const alpha = "0.1.7"; //require("./package.json").version;
const minDaysUsed = 30;

const betas = ["eventtechlive2020", "_template_for_new_event"];
const alphas = ["expo"];

const credentials = new AWS.SharedIniFileCredentials({ profile: "efp-deploy-fp" });
const s3 = new AWS.S3({ apiVersion: "2006-03-01", credentials });
const cloudfront = new AWS.CloudFront({ apiVersion: "2019-03-26", credentials });

async function main() {
    var minDaysUsedMs = new Date().getTime() - minDaysUsed * 1000 * 60 * 60 * 24;
    var minDate = new Date(minDaysUsedMs);

    const cacheFile = __dirname + "/deploy-info.cache.json";
    if (!fs.existsSync(cacheFile)) {
        require("./update-deploy-info");
    }
    const cache = JSON.parse(fs.readFileSync(cacheFile));

    for (const data of cache) {
        if (data.dataLastModified) data.dataLastModified = new Date(data.dataLastModified);

        let requiredNpmVersion;

        if (betas.indexOf(data.expo) !== -1) requiredNpmVersion = beta;
        else if (alphas.indexOf(data.expo) !== -1) requiredNpmVersion = alpha;
        else if (data.dataLastModified < minDate) requiredNpmVersion = null;
        else requiredNpmVersion = stable;

        data.requiredNpmVersion = requiredNpmVersion;

        if (data.requiredNpmVersion && data.requiredNpmVersion !== data.npmVersion) {
            // do update
            await updateIndex(data.expo, data.requiredNpmVersion);
            data.npmVersion = data.requiredNpmVersion;
            fs.writeFileSync(cacheFile, JSON.stringify(cache, null, "\t"));
        }
    }
    doInvalidates();
    // console.log(cache);
}

const pendingInvalidates = [];

async function updateIndex(expo, version) {
    console.log("Updating", expo, version);

    const publicPath = `https://cdn.jsdelivr.net/npm/expofp@${version}/dist/`;
    const template = fs.readFileSync(__dirname + "/template.html", "utf8");
    const html = template.replace(/%PUBLIC_PATH%/g, publicPath).replace(/%EXPO_NAME%/g, expo);
    const fileName = `expos/${expo}/live/index.html`;
    const bucketParams = {
        Bucket: "efp-data",
        Key: fileName,
        Body: html,
        ContentType: "text/html"
    };

    await s3.putObject(bucketParams).promise();

    pendingInvalidates.push(`/${fileName}`);
}

async function doInvalidates() {
    console.log("Doing invalidation...", pendingInvalidates);
    if (pendingInvalidates.length === 0) return;

    const params = {
        DistributionId: "ETXR07B411G19",
        InvalidationBatch: {
            CallerReference: "DUMMY" + +new Date(),
            Paths: {
                Quantity: pendingInvalidates.length,
                Items: pendingInvalidates
            }
        }
    };
    await cloudfront.createInvalidation(params).promise();
    pendingInvalidates.length = 0;
}

main();
