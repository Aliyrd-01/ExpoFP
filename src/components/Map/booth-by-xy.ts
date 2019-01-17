import { getCanvas, getZoomTransform } from "./draw";
import { m4, v3 } from 'twgl.js';
import { svgWidth, svgHeight } from "@/tools/svg";
import { getCurrentMatrixAndScale } from "./config-matrix";


export default function getBoothIdFromClientXy(x: number, y: number): number {
    var b = getLastBoothsFromClientXy(x, y);
    if (b) return b.id;
    return null;
}

// let prevBooth: Booth;

const booths = store.getters.boothsArray as Booth[];
const rectsToBooths = new Map<Rect, Booth>();
const rects: Rect[] = [];
for (const b of booths) {
    rects.push(b.rect);
    rectsToBooths.set(b.rect, b);
}

function getLastBoothsFromClientXy(x: number, y: number): Booth {
    var { pxSvgMatrix } = getCurrentMatrixAndScale();
    const [xs, ys] = m4.transformPoint(pxSvgMatrix, [x, y, 1]);

    // if (prevBooth && prevBooth.rect.containsPoint(xs, ys)) {
    //     return prevBooth;
    // }

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
    return null;
}
