import { m4 } from 'twgl.js';
import { getPxSvgMatrix } from "./matrix";

export default function getBoothIdFromClientXy(x: number, y: number): number {
    // const zz = getSvgPxUnzoomedMatrix();
    // var point = m4.transformPoint(zz, [1000, 1000, 1])
    // __logger.log('point', point);

    const b = getLastBoothsFromClientXy(x, y);
    if (b) return b.id;
    return null;
}

const booths = store.getters.boothsArray as Booth[];
const rectsToBooths = new Map<Rect, Booth>();
const rects: Rect[] = [];

const segments: Rect[] = [];
const segmentToRects = new Map<Rect, Rect[]>();
let superSegment = Rect.fromMultiple(booths.map(b => b.rect));
for (const b of booths) {
    rects.push(b.rect);
    rectsToBooths.set(b.rect, b);
}
const parts = 2; // 4 segmetns
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
__logger.log('hover segmentToRects', segmentToRects);

let prevSegment: Rect;
function getLastBoothsFromClientXy(x: number, y: number): Booth {
    var pxSvgMatrix = getPxSvgMatrix();
    const xys = m4.transformPoint(pxSvgMatrix, [x, y, 1], null);
    const xs = xys[0], ys = xys[1];

    let segm: Rect;
    if (prevSegment && prevSegment.containsPoint(xs, ys)) {
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

    return null;
}
