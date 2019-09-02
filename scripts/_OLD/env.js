const expoFromBranch = require("./expo-from-branch");
const expoDev = require("./expo-dev");
const branch = require("git-branch").sync();

module.exports = function getEnv(mode) {
    try {
        let REACT_APP_EFP_EXPO;
        switch (mode) {
            case "develop":
                REACT_APP_EFP_EXPO = expoFromBranch || expoDev;
                break;
            case "deploy":
                REACT_APP_EFP_EXPO = branch === "master" ? "_template_for_new_event_" : expoFromBranch || expoDev;
                break;
            case "deploy-live":
                REACT_APP_EFP_EXPO = branch === "master" ? "_template_for_new_event_" : expoFromBranch;
                if (!REACT_APP_EFP_EXPO) {
                    throw new Error("Won't deploy expo from non-master or non-expo branch: " + branch);
                }
                break;
            default:
                throw new Error("Unknown env mode");
        }

        // TODO: allow override data, when local files found
        const DATA_URL = `https://${REACT_APP_EFP_EXPO}.expofp.com/data`;

        return {
            REACT_APP_EFP_EXPO,
            DATA_URL
        };
    } catch (e) {
        console.error(e);
        throw e;
    }
};
