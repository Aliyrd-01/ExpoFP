require("colors");
const execa = require("execa");
const fetch = require("node-fetch");
const fs = require("fs");
const async = require("async");

const argv = require("minimist")(process.argv.splice(process.execArgv.length + 2));
const expo = argv["expo"];

if (!expo) throw new Error("--expo not specified");

console.log("Creating package for", expo.yellow);

async function main() {
    const p = await execa("yarn", ["build", "--expo", expo], { stdio: "inherit" });
    if (p.exitCode !== 0) {
        process.exit(p.exitCode);
    }

    {
        const res = await fetch(`https://${expo}.expofp.com/`);
        let text = await res.text();

        text = text.replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/expofp@([^/]+)\/dist\//g, "");
        text = text.replace(/https:\/\/[^\.]+\.expofp\.com\/data\//g, "data/");
        text = text.replace(/( class="expofp-floorplan")/g, '$1 data-data-url="data/"');
        fs.writeFileSync(__dirname + "/../dist/index.html", text);
    }

    fs.mkdirSync(__dirname + "/../dist/data");

    {
        const res = await fetch(`https://${expo}.expofp.com/data/data.js`);
        let text = await res.text();
        fs.writeFileSync(__dirname + "/../dist/data/data.js", text);
        eval(text);
        console.log(__data.title);
    }

    {
        const res = await fetch(`https://${expo}.expofp.com/data/fp.svg.js`);
        let text = await res.text();
        fs.writeFileSync(__dirname + "/../dist/data/fp.svg.js", text);
    }

    let download = [];

    download.push(__data.logo);
    download.push(`../${expo}-logo.png`);
    download.push(...__data.exhibitors.map(x => x.logo));

    download = download.filter(x => !!x);

    console.log("listOfFilesToDownload", download.length);

    const functions = download.map(f => downloadFile.bind(this, f));
    await async.parallelLimit(functions, 10);

    // for (const f of download) {
    //     await downloadFile(f);
    // }

    async function downloadFile(name) {
        const fileName = name.replace(/\?.+/, "");
        const path = __dirname + "/../dist/data/" + fileName;
        const dir = path.replace(/\/[^/]+$/, "");
        console.log(name, fileName, dir);
        const res = await fetch(`https://${expo}.expofp.com/data/${name}`);

        fs.mkdirSync(dir, { recursive: true });
        const fileStream = fs.createWriteStream(path);
        await res.body.pipe(fileStream);
        // fileStream.close();
    }

    // console.log("Writing", __dirname + "/../dist/index.html", text);
}

main().then(function() {
    console.log("Done");
});
