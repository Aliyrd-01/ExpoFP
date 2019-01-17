import { getCanvas, getZoomTransform } from "./draw";
import { m4 } from 'twgl.js';
import { svgWidth, svgHeight } from "@/tools/svg";


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

    const xs = convertXyToSvg(x);//(x * c.deviceScale - c.fpCx) / c.fpScale / c.zoomScale / c.deviceScale;
    const ys = y;//(y * c.deviceScale - c.fpCy) / c.fpScale / c.zoomScale / c.deviceScale;

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

function convertXyToSvg(x) {
    const canvas = getCanvas();
    const zoomTranform = getZoomTransform();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const fpScale = Math.max(canvasWidth / svgWidth, canvasHeight / svgHeight) * 0.95;
    const fpCx = canvasWidth / 2 - svgWidth * fpScale / 2;

    console.log(fpCx, fpScale,canvasWidth, svgWidth, svgWidth * fpScale);
    const xs = (x * devicePixelRatio - fpCx) / fpScale / devicePixelRatio;

    return xs;

    // const 

    // // this translates from svg coord to -1,1

    // let matrix = m4.ortho(0, canvasWidth, canvasHeight, 0, -1, 1);

    // matrix = m4.translate(matrix, [zoomTranform.x * devicePixelRatio, zoomTranform.y * devicePixelRatio, 0]);
    // matrix = m4.scale(matrix, [zoomTranform.k, zoomTranform.k, 1]);
    // matrix = m4.translate(matrix, [canvasWidth / 2, canvasHeight / 2, 0]);

    // // px/svg scale
    // const scale = Math.min(canvasWidth / svgWidth, canvasHeight / svgHeight) * 0.95;

    // matrix = m4.scale(matrix, [scale, scale, 1]);
    // matrix = m4.translate(matrix, [-svgWidth / 2, -svgHeight / 2, 0]);

}