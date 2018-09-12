const jetpack = require('fs-jetpack');
const path = require('path');
const { expo } = require('./expo')

console.log('svg-to-js...')

const base = jetpack.cwd(__dirname + "/..");

//const publicDest = jetpack.cwd(__dirname + '/../public/');

// fp.svg
{
    const svg = base.read(`expos/${expo}/fp.svg`)
    const js = "var __fp = " + JSON.stringify(svg) + ";";
    base.write(`expos/${expo}/fp.js`, js)
}

{
    const iconsSrc = base.cwd("scripts/icons");
    const iconData = {};
    for (const file of iconsSrc.list()) {
        if (!file.toLowerCase().endsWith(".svg")) continue;
        console.log(file);
        const svg = iconsSrc.read(file);
        iconData[path.parse(file).name] = svg;
    }
    const js = "var __icons = " + JSON.stringify(iconData) + ";";
    base.write('public/icons.js', js)
}