const { expoFromBranch, onExpoBranch, onMasterBranch, fallBackExpo, reportVars } = require("./common");
const execa = require("execa");

(async () => {
    const expo = expoFromBranch || fallBackExpo;

    process.env.REACT_APP_EFP_EXPO = expo;
    process.env.REACT_APP_DATA_URL = `https://${expo}.expofp.com/data`;
    process.env.REACT_APP_MODE = "start";

    await overrideDataUrl();

    reportVars();

    const p = await execa("react-scripts", ["start"], { stdio: "inherit" });
    if (p.exitCode !== 0) process.exit(p.exitCode);

    // helper function
    async function overrideDataUrl() {
        const fs = require("fs");
        const express = require("express");
        const app = express();
        const dir = `expos/${expo}/data`;
        const localDataExists = fs.existsSync(dir);
        if (!localDataExists) return;
        const server = await new Promise(resolve => {
            app.use(express.static(dir));
            const server = app.listen(0, () => {
                resolve(server);
            });
        });

        const port = server.address().port;
        console.log("Data listening on port:", port);

        process.env.REACT_APP_DATA_URL = `http://localhost:${port}`;
    }
})();
