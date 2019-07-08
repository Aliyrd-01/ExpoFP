const branch = require("git-branch").sync();
const onMasterBranch = branch === "master";
let expo = branch.startsWith("expo-") ? branch.replace(/^expo-/, "") : null;
const onExpoBranch = !!expo;

const live = process.env.EFP_TARGET === "live";

// let's have some expo branch for non-expo branch
if (!onExpoBranch) {
    expo = onMasterBranch && live ? "_template_for_new_event_" : "expo";
}

// const masterDevExpo

// if (!onMasterBranch && !onExpoBranch && live) {
//     throw new Error(`Unknown expo. Won't run LIVE on ${branch} branch - this is not expo or master branch.`);
// }

module.exports = expo;

module.exports = {
    expo,
    // branch,
    onExpoBranch,
    onMasterBranch
};
