const { specifiedExpo, fallBackExpo, reportVars, argv } = require("./common");
// const Confirm = require("prompt-confirm");
const execa = require("execa");
require("colors");
//const live = !!argv.live;
const dev = !!argv.dev;
const showBucket = !!argv["show-bucket"];
const util = require("util");
const urlExists = util.promisify(require("url-exists"));
const bucketName = showBucket ? "efp-data-show" : "efp-data";

console.log("Destination bucket: ", bucketName.green);

const live = !dev;
// if (!!live === !!dev) {
//     console.error("You should specify either --dev or --live when deploying.".red);
//     process.exit(1);
// }

(async () => {
    let expo = specifiedExpo;

    if (!expo) {
        if (live) {
            console.error("Won't deploy LIVE to fallback expo, please specify --expo=[exponame].".red);
            process.exit(2);
        }
        expo = fallBackExpo;
    }

    process.env.REACT_APP_EFP_EXPO = expo;
    process.env.REACT_APP_DATA_URL = `/data`;
    process.env.REACT_APP_MODE = "deploy" + (dev ? "-dev" : "");

    reportVars();

    const expoCheckUrl = `https://${expo}${showBucket ? ".show" : ""}.expofp.com`;
    const exists = await urlExists(expoCheckUrl);
    if (!exists) {
        console.error("Won't deploy to non-existent expo: ".red + expoCheckUrl.red.bgWhite);
        process.exit(3);
    }

    // if (live && !showBucket) {
    //     const prompt = new Confirm({
    //         message: `Are you sure want to deploy to live ${expo.toUpperCase().yellow}?`,
    //         default: false
    //     });
    //     answer = await prompt.run();
    // }

    const p = await execa("react-scripts", ["build"], { stdio: "inherit" });
    if (p.exitCode !== 0) process.exit(p.exitCode);
    // createShowDevHtml();

    const deployExpo = expo;
    console.log("Deploying dist to ", deployExpo.green);
    const path = `/expos/${deployExpo}/${!live ? "dev" : "live"}`;
    const bucketAndPath = `${bucketName}${path}`;
    const credentials = showBucket ? "efp-dev" : "efp-deploy-fp";
    //s3cmd del -r s3:////efp-data/expos/_template_for_new_event_/live
    console.log("Credentials: ", credentials.green);

    if (deployExpo === "_template_for_new_event_" && !showBucket) {
        console.log("Cleaning up dist", bucketAndPath);
        const cleanup = await execa("s3cmd", ["del", "-r", `s3:////${bucketAndPath}`], { stdio: "inherit" });
        if (cleanup.exitCode !== 0) process.exit(cleanup.exitCode);
    }

    const args = ["./build/**/!(*.map)", "--cwd", "./build", "--bucket", bucketAndPath, "--private", "--profile", credentials];
    // invalidate
    args.push("--distId", showBucket ? "E29FK8L1MN1CCC" : "ETXR07B411G19", "--invalidate", `${path}/index*`);

    const deploy = await execa("s3-deploy", args, { stdio: "inherit" });

    if (deploy.exitCode !== 0) process.exit(deploy.exitCode);
})();
