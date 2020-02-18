const fs = require("fs");
const AWS = require("aws-sdk");
const async = require("async");
const fetch = require("node-fetch");

const stable = "2.0.1";
// const updateToBeta = "0.4.3";
const beta = "2.0.1";
const alpha = require("../package.json").version;
const minDaysUsed = 30;

const betas = ["eventtechlive2020", "miblive2020", "_template_for_new_event_", "demo"];
const alphas = ["thinksoft", "confex20"];
const force = [...alphas];

const credentials = new AWS.SharedIniFileCredentials({ profile: "efp-deploy-fp" });
const s3 = new AWS.S3({ apiVersion: "2006-03-01", credentials });
const cloudfront = new AWS.CloudFront({ apiVersion: "2019-03-26", credentials });

async function main() {
    await checkVersions();
    var minDaysUsedMs = new Date().getTime() - minDaysUsed * 1000 * 60 * 60 * 24;
    var minDate = new Date(minDaysUsedMs);

    await require("./update-deploy-info");
    const cacheFile = __dirname + "/deploy-info.cache.json";
    const cache = JSON.parse(fs.readFileSync(cacheFile));

    const functions = [];

    for (const data of cache) {
        if (data.dataLastModified && data.expo !== "_template_for_new_event_")
            data.dataLastModified = new Date(data.dataLastModified);

        let requiredNpmVersion;

        if (data.expo === "demo") requiredNpmVersion = null;
        else if (alphas.indexOf(data.expo) !== -1) requiredNpmVersion = alpha;
        else if (betas.indexOf(data.expo) !== -1) requiredNpmVersion = beta;
        //|| data.npmVersion === updateToBeta
        else if (data.dataLastModified < minDate) requiredNpmVersion = null;
        else requiredNpmVersion = stable;

        data.requiredNpmVersion = requiredNpmVersion;

        if (data.requiredNpmVersion && (data.requiredNpmVersion !== data.npmVersion || force.indexOf(data.expo) !== -1)) {
            functions.push(async () => {
                await updateIndex(data.expo, data.requiredNpmVersion, data.npmVersion);
                data.npmVersion = data.requiredNpmVersion;
                fs.writeFileSync(cacheFile, JSON.stringify(cache, null, "\t"));
            });
        }
    }

    await async.parallelLimit(functions, 20);

    doInvalidates();
    // console.log(cache);
}

const pendingInvalidates = [];

async function updateIndex(expo, version, oldVersion) {
    console.log(`Updating ${expo} ${oldVersion} => ${version}`);

    const publicPath = `https://${expo}.expofp.com/npm/expofp@${version}/dist/`; //https://cdn.jsdelivr.net
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

async function checkVersions() {
    const version = [stable, beta, alpha];
    for (const v of version) {
        const url = `https://cdn.jsdelivr.net/npm/expofp@${v}/dist/expofp.js`;
        const data = await fetch(url, { method: "HEAD" });
        console.log(url, data.status);
        if (data.status !== 200) throw new Error("Version doesn't exist in CDN: " + v);
    }
}

main();
