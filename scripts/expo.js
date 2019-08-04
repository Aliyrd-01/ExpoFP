const branch = require("git-branch").sync();
const onMasterBranch = branch === "master";
let expo = branch.startsWith("expo-") ? branch.replace(/^expo-/, "") : null;
const onExpoBranch = !!expo;

const live = process.env.EFP_TARGET === "live";

// let's have some expo branch for non-expo branch
if (!onExpoBranch) {
    expo = onMasterBranch && live ? "_template_for_new_event_" : "expo";
}

module.exports = {
    expo,
    // branch,
    onExpoBranch,
    onMasterBranch
};
