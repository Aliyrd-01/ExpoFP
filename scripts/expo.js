const gitBranch = require('git-branch');
//const defaultExpo = "jtrade19";

const fullBranch = gitBranch.sync();
let branch = fullBranch;
if (branch.startsWith("demo-")) branch = "demo";
if (branch.startsWith("jtrade-")) branch = "jtrade19";
if (fullBranch !== branch && process.env.EFP_TARGET === "live") {
    throw new Error(`Unknown expo. Won't run on ${branch} branch`);
}

module.exports = branch;