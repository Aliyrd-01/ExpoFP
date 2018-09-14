const gitBranch = require('git-branch');

let branch = gitBranch.sync();
if (branch === 'master') {
    if (process.env.EFP_TARGET === "live") {
        throw new Error(`Unknown expo. Won't run on ${branch} branch`);
    }
    branch = "demo";
}

module.exports = branch;

// {
//     expo: branch.replace(/-live$/, ''),
//     live: branch.endsWith('-live')
// };