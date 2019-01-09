const gitBranch = require('git-branch');
const defaultExpo = "jtrade19";

let branch = gitBranch.sync();
if (branch.startsWith("demo-")) branch = "demo";
if (branch === 'master') {
    if (process.env.EFP_TARGET === "live") {
        throw new Error(`Unknown expo. Won't run on ${branch} branch`);
    }
    branch = defaultExpo;
}

module.exports = branch;