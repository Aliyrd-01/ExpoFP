import { reaction } from "mobx";
import { m4 } from "twgl.js";
import Rect from "../../core/Rect";
import { getTrianglesFromFpPaths } from "../../data/svg";
import { boothStore, layersStore } from "../../store";
import { Booth } from "../../store/BoothStore";
import { LayersMode } from "../../store/LayerStore";
import logger from "../../tools/logger";
import { Drawer } from "./drawing/Drawer1";
// import { getPxSvgMatrix } from "./matrix";

let rectsToBooths = new Map<Rect, Booth>();
let rects: Rect[] = [];
let boothsWithPaths: Booth[] = [];

let segments: Rect[] = [];
let segmentToRects = new Map<Rect, Rect[]>();
let prevSegment: Rect;

function calculate() {
    const booths = boothStore.booths.filter((b) => b.visible && b.rect && b.rect.w > 0 && b.rect.h > 0);

    rectsToBooths = new Map<Rect, Booth>();
    rects = [];
    segments = [];
    prevSegment = null;
    segmentToRects = new Map<Rect, Rect[]>();

    boothsWithPaths = booths.filter((b) => b.paths);

    let superSegment = Rect.fromMultiple(booths.map((b) => b.rect));
    for (const b of booths) {
        let rect = b.rect;
        if (Math.abs(b.rotate) === (90 * Math.PI) / 180) {
            rect = rect.getRotated90();
        }
        rects.push(rect);
        rectsToBooths.set(rect, b);
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
            const rectsInSegm = rects.filter((r) => segm.intersects(r));
            segmentToRects.set(segm, rectsInSegm);
        }
    }
    logger.log("hover segmentToRects", segmentToRects);
}

reaction(
    () => [boothStore.booths, layersStore.loaded, layersStore.visible],
    () => calculate()
);

function getLastBoothsFromClientXy(x: number, y: number, drawer: Drawer): Booth {
    var pxSvgMatrix = drawer.getPxSvgMatrix();
    const xys = m4.transformPoint(pxSvgMatrix, [x, y, 1], null);
    const xs = xys[0],
        ys = xys[1];

    let segm: Rect;
    if (prevSegment && prevSegment.containsPoint(xs, ys)) {
        segm = prevSegment;
    } else {
        segm = segments.find((s) => s.containsPoint(xs, ys));
    }

    // find segment first
    if (segm) {
        prevSegment = segm;
    }

    const rects = segmentToRects.get(segm);
    if (rects) {
        const found = rects.filter((b) => b.containsPoint(xs, ys));
        if (found.length) {
            let foundOne: Rect;
            if (found.length > 1) {
                // pick the smallest one
                foundOne = found.sort((a, b) => a.w - b.w)[0];
            } else {
                foundOne = found[0];
            }
            let booth = rectsToBooths.get(foundOne);
            return booth.visible ? booth : null;
        }
    }

    // If the point is not found in a segment, we check for polygonal areas
    for (const b of boothsWithPaths) {
        for (const p of b.paths) {
            for (const t of getTrianglesFromFpPaths(p.index, layersStore.mode !== LayersMode.Default ? b.layer.name : "")) {
                if (pointInTriangle(xs, ys, t)) {
                    return b.visible ? b : null;
                }
            }
        }
    }

    return null;
}

function pointInTriangle(x: number, y: number, triangle: number[][]): boolean {
    const [x1, y1] = triangle[0];
    const [x2, y2] = triangle[1];
    const [x3, y3] = triangle[2];

    // Check if the point is inside the triangle using barycentric coordinates
    const denominator = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3);
    const a = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / denominator;
    const b = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / denominator;
    const c = 1 - a - b;

    return a >= 0 && a <= 1 && b >= 0 && b <= 1 && c >= 0 && c <= 1;
}

export default function getBoothIdFromClientXy(x: number, y: number, drawer: Drawer): Booth {
    // const zz = getSvgPxUnzoomedMatrix();
    // var point = m4.transformPoint(zz, [1000, 1000, 1])
    // __logger.log('point', point);

    return getLastBoothsFromClientXy(x, y, drawer);
}
