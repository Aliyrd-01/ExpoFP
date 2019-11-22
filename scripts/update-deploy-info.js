const AWS = require("aws-sdk");
const fs = require("fs");
const fetch = require("node-fetch");
const async = require("async");

// const credentials = new AWS.SharedIniFileCredentials({ profile: "efp-deploy-fp" });
// const s3 = new AWS.S3({ apiVersion: "2006-03-01", credentials });
const cacheFile = __dirname + "/deploy-info.cache.json";

async function main() {
    const cache = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile)) : [];

    const expos = await getListOfExpos();
    console.log("All expos", expos.join(" "));

    const missing = expos.filter(x => !cache.find(c => c.expo === x));
    const functions = missing.map(expo => addExpoData.bind(this, cache, expo));

    await async.parallelLimit(functions, 10);
    // for (const expo of missing) {
    //     //if (cache.find(x => x.expo === expo)) continue;
    //     // if (cache.length > 20) break;

    //     await addExpoData(cache, expo);
    // }
}

async function addExpoData(cache, expo) {
    const data = { expo };
    {
        const res = await fetch(`https://${expo}.expofp.com/data/fp.svg.js`, { method: "HEAD" });
        const date = new Date(res.headers.get("last-modified"));
        data.dataLastModified = date;
    }
    {
        const res = await fetch(`https://${expo}.expofp.com/index.html`);
        const text = await res.text();
        const m = text.match(/https:\/\/cdn\.jsdelivr\.net\/npm\/expofp@([^/]+)\/dist\/expofp.js/);
        data.npmVersion = m ? m[1] : null;
    }
    console.log(expo);
    cache.push(data);
    fs.writeFileSync(cacheFile, JSON.stringify(cache, null, "\t"));
}

async function getListOfExpos() {
    const credentials = new AWS.SharedIniFileCredentials({ profile: "efp-deploy-fp" });
    const s3 = new AWS.S3({ apiVersion: "2006-03-01", credentials });

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

        res.push(...res2.CommonPrefixes.map(obj => obj.Prefix).map(r => r.replace(/expos\/(.+)\//, "$1")));
        console.log("Success", res.length);
    } while (continuationToken);

    return res;
}

module.exports = main();
