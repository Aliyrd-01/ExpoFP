const AWS = require("aws-sdk");
const fs = require("fs");
const fetch = require("node-fetch");

// const credentials = new AWS.SharedIniFileCredentials({ profile: "efp-deploy-fp" });
// const s3 = new AWS.S3({ apiVersion: "2006-03-01", credentials });

async function main() {
    const cacheFile = __dirname + "/deploy-info.cache.json";
    const cache = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile)) : [];

    const expos = await getListOfExpos();
    console.log("All expos", expos.join(" "));

    for (const expo of expos) {
        if (cache.find(x => x.expo === expo)) continue;
        // if (cache.length > 20) break;
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
