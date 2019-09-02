const { expoFromBranch, onExpoBranch, onMasterBranch, fallBackExpo, reportVars } = require("./common");
const execa = require("execa");

(async () => {
    const expo = expoFromBranch || fallBackExpo;

    process.env.REACT_APP_EFP_EXPO = expo;
    process.env.REACT_APP_DATA_URL = `https://${expo}.expofp.com/data`;
    process.env.REACT_APP_MODE = "start";

    reportVars();

    const p = await execa("react-scripts", ["start"], { stdio: "inherit" });
    if (p.exitCode !== 0) process.exit(p.exitCode);
})();
