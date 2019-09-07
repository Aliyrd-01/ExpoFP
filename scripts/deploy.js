const { expoFromBranch, createShowDevHtml, onMasterBranch, fallBackExpo, reportVars } = require("./common");
const Confirm = require("prompt-confirm");
const execa = require("execa");
require("colors");
const live = process.argv[2] === "--live";

(async () => {
    let expo = expoFromBranch;

    if (!expo) {
        if (live) {
            throw new Error("Won't deploy LIVE from non-expo branch. ");
        }
        expo = fallBackExpo;
    }
    // if (!expo && !live) {
    // } else if (!expo && live) {
    //     throw new Error("Won't deploy LIVE from non-expo branch. ");
    // }

    // if (!expo && live && onMasterBranch) {
    //     expo = "_template_for_new_event_";
    // }
    // if (!expo && !live) {
    //     expo = fallBackExpo;
    // }

    process.env.REACT_APP_EFP_EXPO = expo;
    process.env.REACT_APP_DATA_URL = `https://${expo}.expofp.com/data`;
    process.env.REACT_APP_MODE = "deploy" + (live ? "-live" : "");

    reportVars();

    if (live) {
        const prompt = new Confirm({
            message: `Are you sure want to deploy to live ${expo.toUpperCase().yellow}?`,
            default: false
        });
        answer = await prompt.run();
    }

    const p = await execa("react-scripts", ["build"], { stdio: "inherit" });
    if (p.exitCode !== 0) process.exit(p.exitCode);
    createShowDevHtml();

    const deployExpo = expo;
    console.log("Deploying dist to " + deployExpo);

    const path = `/expos/${deployExpo}/${!live ? "dev" : "live"}`;
    const bucket = `efp-data${path}`;

    const args = ["./build/**/!(*.map)", "--cwd", "./build", "--bucket", bucket, "--private", "--profile", "efp-deploy-fp"];
    // invalidate
    args.push("--distId", "ETXR07B411G19", "--invalidate", `${path}/index*`);

    const deploy = await execa("s3-deploy", args, { stdio: "inherit" });

    if (deploy.exitCode !== 0) process.exit(deploy.exitCode);
})();
