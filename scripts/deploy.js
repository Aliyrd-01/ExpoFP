const Confirm = require("prompt-confirm");
const { expo, onMasterBranch, onExpoBranch } = require("./expo");
const execa = require("execa");
// const branch = require('git-branch').sync();
// const config = require(`../expos/${expo}/config`)

const live = process.env.EFP_TARGET === "live";

if (!live && onMasterBranch) {
    throw new Error(`Won't deploy DEV from master`);
} else if (!onExpoBranch && !onMasterBranch) {
    throw new Error(`Won't deploy from non-expo branch`);
}

(async () => {
    let answer = true;
    if (live) {
        const prompt = new Confirm({
            message: `Are you sure want to deploy to live ${expo.toUpperCase()}?`,
            default: false
        });
        answer = await prompt.run();
    }

    if (!answer) {
        return;
    }
    const build = await execa("yarn", ["build"], {
        stdio: "inherit"
    });
    if (build.code !== 0) process.exit(build.code);

    let deployExpo = expo;
    // make all dev deploy to dev-demo so far
    //if (!live) deployExpo = 'demo';
    console.log("Deploying dist to " + deployExpo);

    const path = `/expos/${deployExpo}/${!live ? "dev" : "live"}`;
    const bucket = `efp-data${path}`;

    const args = ["./dist/**/!(*.map)", "--cwd", "./dist", "--bucket", bucket, "--private", "--profile", "efp-deploy-fp"];
    // invalidate
    args.push("--distId", "ETXR07B411G19", "--invalidate", `${path}/index*`);

    const deploy = await execa("s3-deploy", args, {
        stdio: "inherit"
    });

    if (deploy.code !== 0) process.exit(deploy.code);
})();
