import { m4 } from 'twgl.js';
import { getCurrentMatrixAndScale } from "./config-matrix";

export default function getBoothIdFromClientXy(x: number, y: number): number {
    var b = getLastBoothsFromClientXy(x, y);
    if (b) return b.id;
    return null;
}

// let prevBooth: Booth;

const booths = store.getters.boothsArray as Booth[];
const rectsToBooths = new Map<Rect, Booth>();
// const centersToBooths = new Map<Vec2, Booth>();
const rects: Rect[] = [];
// const centers: Vec2[] = []

const segments: Rect[] = [];
const segmentToRects = new Map<Rect, Rect[]>();
let superSegment = Rect.fromMultiple(booths.map(b => b.rect));
for (const b of booths) {
    rects.push(b.rect);
    rectsToBooths.set(b.rect, b);
}
const parts = 2; // 9 segmetns
const segmentWidth = Math.ceil(superSegment.w / parts);
const segmentHeight = Math.ceil(superSegment.h / parts);
for (let x = 0; x < parts; x++) {
    for (let y = 0; y < parts; y++) {
        const startX = superSegment.x1 + x * segmentWidth;
        const startY = superSegment.y1 + y * segmentHeight;
        const segm = Rect.fromXywh(startX, startY, segmentWidth, segmentHeight);
        segments.push(segm);
        const rectsInSegm = rects.filter(r => segm.intersects(r));
        segmentToRects.set(segm, rectsInSegm);
    }
}
console.log('hover segmentToRects', segmentToRects);

let prevSegment: Rect;
function getLastBoothsFromClientXy(x: number, y: number): Booth {
    var { pxSvgMatrix } = getCurrentMatrixAndScale();
    const [xs, ys] = m4.transformPoint(pxSvgMatrix, [x, y, 1]);

    let segm:Rect;
    if (prevSegment && prevSegment.containsPoint(xs, ys)){
        segm = prevSegment;
    } else {
        segm = segments.find(s => s.containsPoint(xs, ys));
    }
    // find segment first
    if (!segm) return null;
    prevSegment = segm;

    const rects = segmentToRects.get(segm);
    const found = rects.filter(b => b.containsPoint(xs, ys));
    if (found.length) {
        let foundOne: Rect;
        if (found.length > 1) {
            // pick the smallest one
            foundOne = found.sort((a, b) => a.w - b.w)[0];
        } else {
            foundOne = found[0];
        }
        return rectsToBooths.get(foundOne);
    }

    // // if (prevBooth && prevBooth.rect.containsPoint(xs, ys)) {
    // //     return prevBooth;
    // // }

    // let shortestDistance: number = Infinity;
    // let closestCenter: Vec2;
    // for (const c of centers) {
    //     const distance = (c[0] - xs) * (c[0] - xs) + (c[1] - ys) * (c[1] - ys);
    //     if (shortestDistance > distance) {
    //         shortestDistance = distance;
    //         closestCenter = c;
    //         const found = centersToBooths.get(closestCenter);
    //         if (found.rect.containsPoint(xs, ys)) return found;
    //     }
    // }
    // // if (closestCenter) {
    // //     const found = centersToBooths.get(closestCenter);
    // //     if (found.rect.containsPoint(xs, ys)) return found;
    // // }

    // // const found = rects.filter(b => b.containsPoint(xs, ys));


    // // if (found.length) {
    // //     let foundOne: Rect;
    // //     if (found.length > 1) {
    // //         // pick the smallest one
    // //         foundOne = found.sort((a, b) => a.w - b.w)[0];
    // //     } else {
    // //         foundOne = found[0];
    // //     }
    // //     return rectsToBooths.get(foundOne);
    // // }
    return null;
}

// for (const b of booths) {
//     // const center = [b.rect.cx, b.rect.cy] as Vec2;
//     // centers.push(center);
//     rects.push(b.rect);
//     rectsToBooths.set(b.rect, b);
//     // centersToBooths.set(center, b);

//     // create large segment
//     // then split x2 over and over
// }

// function getLastBoothsFromClientXy(x: number, y: number): Booth {
//     var { pxSvgMatrix } = getCurrentMatrixAndScale();
//     const [xs, ys] = m4.transformPoint(pxSvgMatrix, [x, y, 1]);

//     // if (prevBooth && prevBooth.rect.containsPoint(xs, ys)) {
//     //     return prevBooth;
//     // }

//     let shortestDistance: number = Infinity;
//     let closestCenter: Vec2;
//     for (const c of centers) {
//         const distance = (c[0] - xs) * (c[0] - xs) + (c[1] - ys) * (c[1] - ys);
//         if (shortestDistance > distance) {
//             shortestDistance = distance;
//             closestCenter = c;
//             const found = centersToBooths.get(closestCenter);
//             if (found.rect.containsPoint(xs, ys)) return found;
//         }
//     }
//     // if (closestCenter) {
//     //     const found = centersToBooths.get(closestCenter);
//     //     if (found.rect.containsPoint(xs, ys)) return found;
//     // }

//     // const found = rects.filter(b => b.containsPoint(xs, ys));


//     // if (found.length) {
//     //     let foundOne: Rect;
//     //     if (found.length > 1) {
//     //         // pick the smallest one
//     //         foundOne = found.sort((a, b) => a.w - b.w)[0];
//     //     } else {
//     //         foundOne = found[0];
//     //     }
//     //     return rectsToBooths.get(foundOne);
//     // }
//     return null;
// }
