import { reaction } from "mobx";
import { m4 } from "twgl.js";
import Rect from "../../core/Rect";
import { boothStore, layersStore } from "../../store";
import { Booth } from "../../store/BoothStore";
import logger from "../../tools/logger";
import { Drawer } from "./drawing/Drawer1";
// import { getPxSvgMatrix } from "./matrix";

let rectsToBooths = new Map<Rect, Booth>();
let rects: Rect[] = [];

let segments: Rect[] = [];
let segmentToRects = new Map<Rect, Rect[]>();

function calculate(booths: Booth[]) {
    rectsToBooths = new Map<Rect, Booth>();
    rects = [];
    segments = [];
    segmentToRects = new Map<Rect, Rect[]>();

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
    () => [boothStore.booths, layersStore.loaded],
    () => calculate(boothStore.booths.filter((b) => b.rect))
);

let prevSegment: Rect;
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
    if (!segm) return null;
    prevSegment = segm;

    const rects = segmentToRects.get(segm);
    if (!rects) return null;

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

    return null;
}

export default function getBoothIdFromClientXy(x: number, y: number, drawer: Drawer): Booth {
    // const zz = getSvgPxUnzoomedMatrix();
    // var point = m4.transformPoint(zz, [1000, 1000, 1])
    // __logger.log('point', point);

    return getLastBoothsFromClientXy(x, y, drawer);
}
