const gitBranch = require('git-branch');
//const defaultExpo = "jtrade19";

const branch = gitBranch.sync();
let expo = branch.replace(/^expo-/, '');
const expoBranch = expo !== branch;
// let's have some expo branch for non-expo branch
if (!expoBranch) expo = "expo"

if (!expoBranch && process.env.EFP_TARGET === "live") {
    throw new Error(`Unknown expo. Won't run LIVE on ${branch} branch - this is not expo branch.`);
}

module.exports = expo;