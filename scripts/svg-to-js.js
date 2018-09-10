const jetpack = require('fs-jetpack');
const path = require('path');

console.log('svg-to-js...')

const src = jetpack.cwd(__dirname);
const dest = jetpack.cwd(__dirname + '/../public/');

{
    const svg = src.read('fp.svg')
    const js = "var __fp = " + JSON.stringify(svg) + ";";
    dest.write('fp.js', js)
}

{
    const iconsSrc = src.cwd("icons");
    const iconData = {};
    for (const file of iconsSrc.list()) {
        if (!file.toLowerCase().endsWith(".svg")) continue;
        console.log(file);
        const svg = iconsSrc.read(file);
        iconData[path.parse(file).name] = svg;
    }
    const js = "var __icons = " + JSON.stringify(iconData) + ";";
    dest.write('icons.js', js)
}