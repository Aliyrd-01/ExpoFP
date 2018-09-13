const gitBranch = require('git-branch');

const branch = gitBranch.sync();
if (branch === 'master') throw new Error(`Unknown expo. Won't run on ${branch} branch`);

module.exports = branch;

// {
//     expo: branch.replace(/-live$/, ''),
//     live: branch.endsWith('-live')
// };