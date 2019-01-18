import { m4 } from 'twgl.js';
import { svgWidth, svgHeight } from '@/tools/svg';
import { allDrawers, getCanvas, getZoomTransform, getVisibleRect, subscribeZoomDimensionsChange, requireUpdate } from "./draw";

let matrix: number[][];
let pxSvgMatrix: number[][];
let ptscale: number;
let dirty = true;

export default function configMatrix() {
    requireUpdate(update);
    subscribeZoomDimensionsChange(() => { dirty = true; requireUpdate(update); });
}

export function getCurrentMatrixAndScale() { ensureMatrixAndScale(); return { matrix, ptscale, pxSvgMatrix } };

function update() {
    ensureMatrixAndScale();
    for (const d of allDrawers) {
        d.matrix = matrix;
        d.ptscale = ptscale;
    }
}

function ensureMatrixAndScale() {
    if (!dirty) return;
    dirty = false;
    const canvas = getCanvas();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const zoomTranform = getZoomTransform();
    const visibleRect = getVisibleRect();

    matrix = m4.ortho(0, canvasWidth, canvasHeight, 0, -1, 1);
    pxSvgMatrix = m4.scale(m4.identity(), [1 / devicePixelRatio, 1 / devicePixelRatio, 1]);
    // px/svg scale
    const scale = Math.min(canvasWidth / svgWidth, canvasHeight / svgHeight) * 0.95;

    const matrices = [matrix, pxSvgMatrix];
    const actions = [
        [m4.translate, [zoomTranform.x * devicePixelRatio, zoomTranform.y * devicePixelRatio, 0]],
        [m4.scale, [zoomTranform.k, zoomTranform.k, 1]],
        [m4.translate, [canvasWidth / 2, canvasHeight / 2, 0]],
        [m4.scale, [scale, scale, 1]],
        [m4.translate, [-svgWidth / 2, -svgHeight / 2, 0]],
    ];

    // do the magic
    actions.forEach(a => matrices.forEach(m => a[0](m, a[1], m)));

    m4.inverse(pxSvgMatrix, pxSvgMatrix);

    // matrices.forEach(m => m4.translate(m, [zoomTranform.x * devicePixelRatio, zoomTranform.y * devicePixelRatio, 0], m))

    // matrix = m4.translate(matrix, [zoomTranform.x * devicePixelRatio, zoomTranform.y * devicePixelRatio, 0]);
    // pxSvgMatrix = m4.translate(pxSvgMatrix, [zoomTranform.x * devicePixelRatio, zoomTranform.y * devicePixelRatio, 0]);
    // matrix = m4.scale(matrix, [zoomTranform.k, zoomTranform.k, 1]);
    // pxSvgMatrix = m4.scale(pxSvgMatrix, [zoomTranform.k, zoomTranform.k, 1]);
    // matrix = m4.translate(matrix, [canvasWidth / 2, canvasHeight / 2, 0]);
    // pxSvgMatrix = m4.translate(pxSvgMatrix, [canvasWidth / 2, canvasHeight / 2, 0]);



    // matrix = m4.scale(matrix, [scale, scale, 1]);
    // pxSvgMatrix = m4.scale(pxSvgMatrix, [scale, scale, 1]);
    // matrix = m4.translate(matrix, [-svgWidth / 2, -svgHeight / 2, 0]);
    // pxSvgMatrix = m4.translate(pxSvgMatrix, [-svgWidth / 2, -svgHeight / 2, 0]);


    // matrix converts from svg to -1..1

    //pxSvgMatrix = m4.inverse(matrix);

    ptscale = 1 / scale / zoomTranform.k;

    // matrix can translate from svg coordinate to -1,1
    // we need a matrix to translate from browser px to svg
    console.log('Matrix updated', canvasWidth, canvasHeight, zoomTranform, matrix, ptscale);
}

