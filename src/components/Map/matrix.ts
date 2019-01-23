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
export function getSvgPxUnzoomedMatrix() { ensureAll(); return svgPxUnzoomedMatrix; }
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

function ensureAll() {
    if (!dirty) return;
    dirty = false;

    visibleRectPt = visibleRect.scale(devicePixelRatio);
    pxSvgScale = Math.min(visibleRectPt.w / svgWidth, visibleRectPt.h / svgHeight) * visibleScale;

    // create helper matrices
    const zoomMatrix = m4.translation([zoomTransform.x * devicePixelRatio, zoomTransform.y * devicePixelRatio, 0]);
    m4.scale(zoomMatrix, [zoomTransform.k, zoomTransform.k, 1], zoomMatrix);

    // px/svg scale
    const centerSvgMatrix = m4.translation([visibleRectPt.cx, visibleRectPt.cy, 0]);
    m4.scale(centerSvgMatrix, [pxSvgScale, pxSvgScale, 1], centerSvgMatrix);
    m4.translate(centerSvgMatrix, [-svgWidth / 2, -svgHeight / 2, 0], centerSvgMatrix);

    // create matrices
    matrix = m4.ortho(0, canvasWidth, canvasHeight, 0, -1, 1);
    m4.multiply(matrix, zoomMatrix, matrix);
    m4.multiply(matrix, centerSvgMatrix, matrix);

    pxSvgMatrix = m4.scale(m4.identity(), [1 / devicePixelRatio, 1 / devicePixelRatio, 1]);
    svgPxUnzoomedMatrix = m4.copy(pxSvgMatrix);
    m4.multiply(pxSvgMatrix, zoomMatrix, pxSvgMatrix);
    m4.multiply(pxSvgMatrix, centerSvgMatrix, pxSvgMatrix);
    m4.inverse(pxSvgMatrix, pxSvgMatrix);

    m4.multiply(svgPxUnzoomedMatrix, centerSvgMatrix, svgPxUnzoomedMatrix);

    ptscale = 1 / pxSvgScale / zoomTransform.k;

    fireMatrixChange();
    if (prevPtscale !== ptscale) {
        firePtscaleChange();
        prevPtscale = ptscale;
    }
}