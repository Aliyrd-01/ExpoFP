const jetpack = require('fs-jetpack');
const path = require('path');
const expo = require('./expo');
const svgMesh3d = require('svg-mesh-3d');

console.log('svg-to-js...')

const base = jetpack.cwd(__dirname + "/..");

//const publicDest = jetpack.cwd(__dirname + '/../public/');

// fp.svg
{
    let svgText = base.read(`expos/${expo}/fp.svg`)
    const paths = [];
    let i = 0;
    svgText = svgText.replace(/d="(M[^"]+)"/g, (m, g1) => {
        paths.push(g1);
        return `data-index="${i++}"`;
    });
    const fpPaths = [];
    for (const p of paths) {
        const m = svgMesh3d(p, { normalize: false, scale: 8 });
        fpPaths.push(m);
    }

    let js = "var __fp = " + JSON.stringify(svgText) + ";";
    js += "\n";
    js += "var __fpPaths = " + JSON.stringify(fpPaths) + ";";
    base.write(`expos/${expo}/fp.js`, js)
}

// {
//     const iconsSrc = base.cwd("scripts/icons");
//     const iconData = {};
//     for (const file of iconsSrc.list()) {
//         if (!file.toLowerCase().endsWith(".svg")) continue;
//         console.log(file);
//         const svg = iconsSrc.read(file);
//         iconData[path.parse(file).name] = svg;
//     }
//     const js = "var __icons = " + JSON.stringify(iconData) + ";";
//     base.write('public/icons.js', js)
// }


