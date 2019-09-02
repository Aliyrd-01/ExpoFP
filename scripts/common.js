const branch = require("git-branch").sync();
require("colors");

const onMasterBranch = branch === "master";
let expoFromBranch = branch.startsWith("expo-") ? branch.replace(/^expo-/, "") : null;

function reportVars() {
    console.log("REACT_APP_MODE", process.env.REACT_APP_MODE.yellow);
    console.log("REACT_APP_EFP_EXPO", process.env.REACT_APP_EFP_EXPO.yellow);
    console.log("REACT_APP_DATA_URL", process.env.REACT_APP_DATA_URL.yellow);
    console.log("");
}

module.exports = {
    expoFromBranch,
    onMasterBranch,
    fallBackExpo: "jtrade19",
    reportVars
};
