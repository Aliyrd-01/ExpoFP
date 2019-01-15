import { m4 } from 'twgl.js';
import { svgWidth, svgHeight } from '@/tools/svg';
import { allDrawers, getCanvas, getZoomTransform, subscribeZoomDimensionsChange, requireUpdate } from "./draw";

let matrix: number[][];
let ptscale: number;
let dirty = true;

export default function configMatrix() {
    requireUpdate(update);
    subscribeZoomDimensionsChange(() => { dirty = true; requireUpdate(update); });
}

export function getCurrentMatrixAndScale() { ensureMatrixAndScale(); return { matrix, ptscale } };

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

    matrix = m4.ortho(0, canvasWidth, canvasHeight, 0, -1, 1);
    matrix = m4.translate(matrix, [zoomTranform.x * devicePixelRatio, zoomTranform.y * devicePixelRatio, 0]);
    matrix = m4.scale(matrix, [zoomTranform.k, zoomTranform.k, 1]);
    matrix = m4.translate(matrix, [canvasWidth / 2, canvasHeight / 2, 0]);

    // px/svg scale
    const scale = Math.min(canvasWidth / svgWidth, canvasHeight / svgHeight) * 0.95;

    matrix = m4.scale(matrix, [scale, scale, 1]);
    matrix = m4.translate(matrix, [-svgWidth / 2, -svgHeight / 2, 0]);

    ptscale = 1 / scale / zoomTranform.k;

    console.log('Matrix updated', matrix, ptscale);
}