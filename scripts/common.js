const git = require('git-rev-sync');
require("colors");
const branch = git.branch();
// const os = require("os");
const dateFormat = require('dateformat');
const username = require('username');

// const onMasterBranch = branch === "master";
let expoFromBranch = branch.startsWith("expo-") ? branch.replace(/^expo-/, "") : null;

function reportVars() {
    process.env.REACT_APP_VERSION = `${git.long()} ${dateFormat("ddd mmm dd yyyy HH:MM:ss Z")} (${username.sync()})`

    console.log("REACT_APP_MODE", process.env.REACT_APP_MODE.yellow);
    console.log("REACT_APP_EFP_EXPO", process.env.REACT_APP_EFP_EXPO.yellow);
    console.log("REACT_APP_DATA_URL", process.env.REACT_APP_DATA_URL.yellow);
    console.log("REACT_APP_VERSION", process.env.REACT_APP_VERSION.yellow);
    console.log("");
}

// function createShowDevHtml() {
//     const fs = require("fs");
//     const path = require("path");
//     const dist = "./build";
//     const prodIndex = path.join(dist, "index.html");
//     const devIndex = path.join(dist, "index.dev.html");
//     const showIndex = path.join(dist, "index.show.html");

//     const data = fs.readFileSync(prodIndex, "utf-8");

//     const dataUrlDev = `https://s3.amazonaws.com/efp-data-dev/expos/${process.env.REACT_APP_EFP_EXPO}/data`;
//     const dataUrlShow = `https://s3.amazonaws.com/efp-data-show/expos/${process.env.REACT_APP_EFP_EXPO}/data`;

//     fs.writeFileSync(devIndex, data.replace(new RegExp(escapeRegExp(process.env.REACT_APP_DATA_URL), "g"), dataUrlDev));
//     fs.writeFileSync(showIndex, data.replace(new RegExp(escapeRegExp(process.env.REACT_APP_DATA_URL), "g"), dataUrlShow));

//     function escapeRegExp(string) {
//         return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
//     }
// }

module.exports = {
    expoFromBranch,
    // onMasterBranch,
    fallBackExpo: "jtrade19",
    reportVars,
    // createShowDevHtml
};
