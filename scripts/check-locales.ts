import glob from "glob";
import fs from "fs";
import path from "path";
import chalk from "chalk";

console.log("i18n-find");

const srcFiles = glob.sync("../src/**/*.{ts,tsx}");
const regex = /\Wt\("([^"]+)/g;

const srcKeys = new Set<string>();
for (const file of srcFiles) {
    const content = fs.readFileSync(file, "utf-8");
    [...content.matchAll(regex)].forEach((x) => {
        const js = JSON.parse(`"${x[1]}"`);
        // console.log("Found", js, "in", file);
        srcKeys.add(js);
    });
}

const localeFiles = glob.sync("../public/locales/*.json");
for (const file of localeFiles) {
    console.log(chalk.dim("Checking locale: " + path.basename(file)));
    const localeData = require(file);
    const localeKeys = new Set(Object.keys(localeData));
    for (const key of localeKeys) {
        if (!srcKeys.has(key)) {
            console.log("Extra key", chalk.cyan(chalk.bold(key)), "in", chalk.magenta(path.basename(file)));
        }
    }
    for (const key of srcKeys) {
        if (!localeKeys.has(key)) {
            console.log("Missing key", chalk.cyan(chalk.bold(key)), "in", chalk.magenta(path.basename(file)));
        }
    }
}
