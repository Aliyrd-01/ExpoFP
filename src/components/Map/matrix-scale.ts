import { m4 } from 'twgl.js';
import { svgWidth, svgHeight } from '@/tools/svg';

export function subscribeToZoomChange(func) {

}


export function getCurrentMatrixScale() {
    let matrix:number[][] = m4.ortho(0, canvasWidth, canvasHeight, 0, -1, 1);
    matrix = m4.translate(matrix, [zoomTranform.x * devicePixelRatio, zoomTranform.y * devicePixelRatio, 0]);
    matrix = m4.scale(matrix, [zoomTranform.k, zoomTranform.k, 1]);
    matrix = m4.translate(matrix, [canvasWidth / 2, canvasHeight / 2, 0]);

    // px/svg scale
    const scale = Math.min(canvasWidth / svgWidth, canvasHeight / svgHeight) * 0.95;

    matrix = m4.scale(matrix, [scale, scale, 1]);
    matrix = m4.translate(matrix, [-svgWidth / 2, -svgHeight / 2, 0]);

    const ptscale = 1 / scale / zoomTranform.k;

    return { matrix, ptscale };
}

// default one
let canvasWidth: number;
let canvasHeight: number;
let zoomTranform: ZoomTranform = { k: 1, x: 0, y: 0 };
type ZoomTranform = { k: number, x: number, y: number };

export function setZoomAndDimensions(zoomTransformParam?: ZoomTranform,
    canvasWidthParam?: number,
    canvasHeightParam?: number) {
    if (zoomTransformParam) zoomTranform = zoomTransformParam;
    if (canvasWidthParam) canvasWidth = canvasWidthParam;
    if (canvasHeightParam) canvasHeight = canvasHeightParam;
}