import { m4 } from 'twgl.js';
import { svgWidth, svgHeight } from '@/tools/svg';


// svg -> -1..1
let matrix: number[][];
// browser px -> svg
let pxSvgMatrix: number[][];
// canvas point -> svg scale
let ptscale: number;
// svg -> canvas point (when unzoomed) 
let pxSvgScale: number;
// replace above with:
// svg -> browser px matrix (unzoomed)
let svgPxUnzoomedMatrix: number[][];
let visibleRectPt: Rect;

//
// dependencies and misc
//
let dirty = true;
let prevPtscale: number;

let canvasWidth: number;
let canvasHeight: number;
let visibleRect: Rect;
let visibleScale: number;
let zoomTransform: ZoomTransform;

//
// setters
//
export function setZoomTransform(transform: ZoomTransform) {
    zoomTransform = transform;
    dirty = true;
}

export function setVisibleRect(rect: Rect) {
    visibleRect = rect;
    dirty = true;
}

export function setCanvasSize(width: number, height: number) {
    canvasWidth = width;
    canvasHeight = height;
    dirty = true;
}

export function setVisbleScale(scale: number) {
    visibleScale = scale;
    dirty = true;
}

//
// getters
//
export function getMatrix() { ensureAll(); return matrix; }
export function getPtscale() { ensureAll(); return ptscale; }
export function getPxSvgMatrix() { ensureAll(); return pxSvgMatrix; }
export function getPxSvgScale() { ensureAll(); return pxSvgScale; }
export function getZoomScale() { return zoomTransform.k; }
export function getVisibleRect() { return visibleRect; }

//
// subscribe
//
const ptscaleChangeSubscribers: ((ptscale: number) => void)[] = [];
export function subscribePtscaleChange(cb: (ptscale) => void) { ptscaleChangeSubscribers.push(cb); }
function firePtscaleChange() { ptscaleChangeSubscribers.forEach(x => x(ptscale)); }

const matrixChangeSubscribers: ((matrix: number[][]) => void)[] = [];
export function subscribeMatrixChange(cb: (ptscale: number[][]) => void) { matrixChangeSubscribers.push(cb); }
function fireMatrixChange() { matrixChangeSubscribers.forEach(x => x(matrix)); }

//
// core
//

// function applyTransform(m4method, m4param, matrices) {
//     matrices.forEach(m => m4method(m, m4param, m));
// }

function ensureAll() {
    if (!dirty) return;
    dirty = false;

    visibleRectPt = visibleRect.scale(devicePixelRatio);

    matrix = m4.ortho(0, canvasWidth, canvasHeight, 0, -1, 1);
    pxSvgMatrix = m4.scale(m4.identity(), [1 / devicePixelRatio, 1 / devicePixelRatio, 1]);
    // px/svg scale
    pxSvgScale = Math.min(visibleRectPt.w / svgWidth, visibleRectPt.h / svgHeight) * visibleScale;

    const zoomMatrix = m4.translation([zoomTransform.x * devicePixelRatio, zoomTransform.y * devicePixelRatio, 0]);
    m4.scale([zoomTransform.k, zoomTransform.k, 1], zoomMatrix);

    const centerSvgMatrix = m4.translation([visibleRectPt.cx, visibleRectPt.cy, 0]);
    m4.scale(centerSvgMatrix, [pxSvgScale, pxSvgScale, 1], centerSvgMatrix);
    m4.translate(centerSvgMatrix, [-svgWidth / 2, -svgHeight / 2, 0], centerSvgMatrix);

    // applyTransform(m4.translate, [zoomTransform.x * devicePixelRatio, zoomTransform.y * devicePixelRatio, 0], [matrix, pxSvgMatrix]);
    // applyTransform(m4.scale, [zoomTransform.k, zoomTransform.k, 1], [matrix, pxSvgMatrix]);
    m4.multiply(matrix, zoomMatrix, matrix);
    m4.multiply(pxSvgMatrix, zoomMatrix, pxSvgMatrix);

    m4.multiply(matrix, centerSvgMatrix, matrix);
    m4.multiply(pxSvgMatrix, centerSvgMatrix, pxSvgMatrix);

    // applyTransform(m4.translate, [visibleRectPt.cx, visibleRectPt.cy, 0], [matrix, pxSvgMatrix]);
    // applyTransform(m4.scale, [pxSvgScale, pxSvgScale, 1], [matrix, pxSvgMatrix]);
    // applyTransform(m4.translate, [-svgWidth / 2, -svgHeight / 2, 0], [matrix, pxSvgMatrix]);

    m4.inverse(pxSvgMatrix, pxSvgMatrix);

    ptscale = 1 / pxSvgScale / zoomTransform.k;

    fireMatrixChange();
    if (prevPtscale !== ptscale) {
        firePtscaleChange();
        prevPtscale = ptscale;
    }
}