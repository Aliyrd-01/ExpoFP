import svg from "@/tools/svg";
import { generateUniqueSlug } from "@/services/slug";
import { getNextId } from "@/services/id";


const booths = __data.booths.reduce((a, c) => (a[c.id] = c) && a, {} as { [id: number]: Booth });
//const boothsBySlug = new Map<string, Booth>();
const boothsByName = new Map<string, Booth>();

// setup slugs
for (const b of Object.values(booths)) {
    b.slug = generateUniqueSlug(b.name);
    // b.hideName = b.name.startsWith("_");
    //boothsBySlug.set(b.slug, b);
    boothsByName.set(b.name.toLowerCase(), b);

    if (EFP_EXPO === "cbresupplypartner") {
        if (b.special === false && !b.availColor && b.type) {
            if (b.type.indexOf("Premium A - 2m height restriction Passport") !== -1) b .availColor = "#939393";
            else if (b.type.indexOf("No free-standing") !== -1) b .availColor = "#BA3DC8";
            else if (b.type.endsWith("Passport")) b.availColor = "#939393";
            else if (b.type.startsWith("Premium A - 2m")) b.availColor = "#FF9E4E";
            else if (b.type.startsWith("Premium A - 4m")) b.availColor = "#EA4335";
            else if (b.type.startsWith("Premium B - 2m")) b.availColor = "#523BC0";
            else if (b.type.startsWith("Premium C - 2.4m")) b.availColor = "#3ECC78";
        }
        if (b.special === false) {
            //b.size = undefined;
        }
    }
}

for (const el of d3.select(svg).selectAll('#Booths g[id^=b], #Booths rect[id^=b]').nodes() as (SVGRectElement | SVGPathElement)[]) {
    let rect: SVGRectElement;
    if (el.tagName === 'rect') {
        rect = el as SVGRectElement;
    } else {
        rect = el.lastElementChild as SVGRectElement;
        if (!rect || rect.tagName !== 'rect') continue;

    }

    const idInSvg = (el.getAttribute("data-name") || el.id).substring(1).toLowerCase();

    let booth = boothsByName.get(idInSvg);
    if (!booth) {
        __logger.error("SVG booth rect not found in __data:", idInSvg);
        // create fake booth
        booth = {
            id: getNextId(),
            name: idInSvg.toUpperCase(),
            slug: generateUniqueSlug(idInSvg),
            exhibitors: [],
            special: false,
            error: true
        } as any;
        booths[booth.id] = booth;
        boothsByName.set(idInSvg, booth);
    } //else

    booth.rect = Rect.fromSvgRectElement(rect);
    booth.noLabels = rect.id.startsWith("no");
    if (booth.special === false) {
        booth.availColor = el.getAttribute("data-avail-color") || booth.availColor;
        booth.soldColor = el.getAttribute("data-sold-color") || booth.soldColor;
        booth.size = el.getAttribute("data-size") || booth.size;
        booth.type = el.getAttribute("data-type") || booth.type;
        booth.price = el.getAttribute("data-price") || booth.price;
    } else if (booth.special === true) {
        booth.color = el.getAttribute("data-color") || booth.color;
    }

    const transform = rect.getAttribute("transform");
    if (transform) {
        const mt = transform.match(/translate\(([\-0-9\.]+) ([\-0-9\.]+)\) rotate\(([\-0-9\.]+)\)/);
        if (mt) {
            // const translateX = parseFloat(mt[1]);
            // const translateY = parseFloat(mt[2]);
            const rotate = parseFloat(mt[3]);
            booth.rotate = (-rotate * Math.PI) / 180;
        } else {
            const mt = transform.match(/rotate\(([\-0-9\.]+).*\)/);
            if (mt) {
                const rotate = parseFloat(mt[1]);
                booth.rotate = (-rotate * Math.PI) / 180;
            }
            else {
                const mm = transform.match(/matrix\(\s*([\-0-9\.]+)\s*(?:,|\s)\s*([\-0-9\.]+)\s*(?:,|\s)\s*([\-0-9\.]+)\s*(?:,|\s)\s*([\-0-9\.]+)\s*(?:,|\s)\s*([\-0-9\.]+)\s*(?:,|\s)\s*([\-0-9\.]+)\s*\)/);
                if (mm) {
                    booth.rotate = Math.asin(-parseFloat(mm[2]));
                }
            }
        }
        // ET: this is a fix for Illustrator re-save (it can have large rotates)
        const maxDegree = 45.5;
        if (booth.rotate > maxDegree / 180 * Math.PI) {
            booth.rotate = booth.rotate - 90 * Math.PI / 180;
            // also swap width and height of rect
            booth.rect = booth.rect.getRotated90();
        }     
    }

    if (!booth.rotate && (booth.rect.h > booth.rect.w * 1.5) && booth.name.length > 5){
        booth.rotate = 90 * Math.PI / 180;
        booth.rect = booth.rect.getRotated90();
    }

    if (el.tagName === 'g') {
        booth.paths = [];
        for (const kid of d3.select(el).selectAll('path, rect').nodes() as (SVGPathElement | SVGRectElement)[]) {
            if (kid.tagName === 'path') {
                const path = kid as SVGPathElement;
                if (path.tagName !== 'path') continue;
                const color = path.style.fill;
                const d = parseInt(path.getAttribute('data-index'));
                if (!d) continue;
                // const triangles = getTrianglesFromFpPaths(d);
                const pi: PathInfo = {
                    triangles: getTrianglesFromFpPaths(d),
                    color
                };
                booth.paths.push(pi);
            }
        }
    }
}

// for (const r of d3
//     .select(svg)
//     .select("#Booths")
//     .selectAll("rect")
//     .nodes() as SVGRectElement[]) {
//     const idInSvg = (r.getAttribute("data-name") || r.id).substring(1).toLowerCase();
//     let booth = boothsByName.get(idInSvg);
//     if (!booth) {
//         __logger.error("SVG booth rect not found in __data:", idInSvg);
//         // create fake booth
//         booth = {
//             id: getNextId(),
//             name: idInSvg.toUpperCase(),
//             slug: generateUniqueSlug(idInSvg),
//             exhibitors: [],
//             error: true
//         } as any;
//         booths[booth.id] = booth;
//         boothsByName.set(idInSvg, booth);
//     } //else

//     booth.rect = Rect.fromSvgRectElement(r);

//     const transform = r.getAttribute("transform");
//     if (transform) {
//         const mt = transform.match(/translate\(([\-0-9\.]+) ([\-0-9\.]+)\) rotate\(([\-0-9\.]+)\)/);
//         if (mt) {
//             // const translateX = parseFloat(mt[1]);
//             // const translateY = parseFloat(mt[2]);
//             const rotate = parseFloat(mt[3]);
//             booth.rotate = (-rotate * Math.PI) / 180;
//         } else {
//             const mt = transform.match(/rotate\(([\-0-9\.]+).*\)/);
//             if (mt) {
//                 const rotate = parseFloat(mt[1]);
//                 booth.rotate = (-rotate * Math.PI) / 180;
//             }
//             else {
//                 const mm = transform.match(/matrix\(\s*([\-0-9\.]+)\s*(?:,|\s)\s*([\-0-9\.]+)\s*(?:,|\s)\s*([\-0-9\.]+)\s*(?:,|\s)\s*([\-0-9\.]+)\s*(?:,|\s)\s*([\-0-9\.]+)\s*(?:,|\s)\s*([\-0-9\.]+)\s*\)/);
//                 if (mm) {
//                     booth.rotate = Math.asin(-parseFloat(mm[2]));
//                 }
//             }
//         }
//         // ET: this is a fix for Illustrator re-save (it can have large rotates)
//         const maxDegree = 45.5;
//         if (booth.rotate > maxDegree / 180 * Math.PI) {
//             booth.rotate = booth.rotate - 90 * Math.PI / 180;
//             // also swap width and height of rect
//             const r = booth.rect;
//             booth.rect = Rect.fromCxcywh(r.cx, r.cy, r.h, r.w);
//         }
//     }
// }

function getTrianglesFromFpPaths(index: number) {
    const mesh = __fpPaths[index];
    // TODO: remove in future versions 
    for (const p of mesh.positions) {
        // a bug in svgMesh3d when normalize: false ?
        p[1] = Math.abs(p[1]);
        p.length = 2;
    }
    const pathTriangles = [];
    for (const c of mesh.cells) {
        pathTriangles.push([
            mesh.positions[c[0]],
            mesh.positions[c[1]],
            mesh.positions[c[2]],
        ]);
    }

    return pathTriangles;
}

// for (const svgPath of d3
//     .select(svg)
//     .select("#Booths")
//     .selectAll("path")
//     .nodes() as SVGPathElement[]) {
//     const idInSvg = (svgPath.getAttribute("data-name") || svgPath.id).substring(1).toLowerCase();
//     let booth = boothsByName.get(idInSvg);
//     if (!booth) {
//         __logger.error("SVG booth path not found in __data:", idInSvg);
//         continue;
//     }
//     const d = parseInt(svgPath.getAttribute('data-index'));
//     booth.pathTriangles = getTrianglesFromFpPaths(d);
//     booth.borderPathTriangles = getTrianglesFromFpPaths(d + 1);
// }



for (const b of Object.values(booths)) {
    if (!b.rect) {
        __logger.error("__data booth not found in SVG:", b.name, b);
        delete booths[b.id];
    }
}

export default {
    state: booths,
    getters: {
        boothsArray: (state: any) => Object.values(state)
    }
};
