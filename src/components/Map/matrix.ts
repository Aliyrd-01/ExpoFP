import { m4 } from 'twgl.js';
import { svgWidth, svgHeight } from '@/tools/svg';

let started = false;
// svg -> -1..1
let matrix: Float32Array;
// browser px -> svg
let pxSvgMatrix: Float32Array;
// canvas point -> svg scale
let ptscale: number;
// svg -> browser px matrix (unzoomed)
let svgPxUnzoomedMatrix: Float32Array;

//
// dependencies and misc
//
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
    // console.log('zz', transform);
    zoomTransform = transform;
    calcAll();
}

export function setVisibleRect(rect: Rect) {
    visibleRect = rect;
    calcAll();
}

export function setCanvasSize(width: number, height: number) {
    canvasWidth = width;
    canvasHeight = height;
    calcAll();
}

export function setVisbleScale(scale: number) {
    visibleScale = scale;
    calcAll();
}


export function start() {
    started = true;
    calcAll();
}

//
// getters
//
export function getMatrix() { return matrix; }
export function getPtscale() { return ptscale; }
export function getPxSvgMatrix() { return pxSvgMatrix; }
export function getSvgPxUnzoomedMatrix() { return svgPxUnzoomedMatrix; }
export function getZoomTransform() { return zoomTransform; }
export function getVisibleRect() { return visibleRect; }

//
// subscribe
//
const ptscaleChangeSubscribers: ((ptscale: number) => void)[] = [];
export function subscribePtscaleChange(cb: (ptscale) => void) { ptscaleChangeSubscribers.push(cb); }
function firePtscaleChange() { ptscaleChangeSubscribers.forEach(x => x(ptscale)); }

const matrixChangeSubscribers: ((matrix: Float32Array) => void)[] = [];
export function subscribeMatrixChange(cb: (ptscale: Float32Array) => void) { matrixChangeSubscribers.push(cb); }
function fireMatrixChange() { matrixChangeSubscribers.forEach(x => x(matrix)); }

//
// core
//

function calcAll() {
    if (!started) return;
    // dirty = false;

    const visibleRectPt = visibleRect.scale(devicePixelRatio);
    const svgPxScaleUnzoomed = Math.min(visibleRectPt.w / svgWidth, visibleRectPt.h / svgHeight);
    const svgPxScale = svgPxScaleUnzoomed * visibleScale;

    // create helper matrices
    const zoomMatrix = m4.translation([zoomTransform.x * devicePixelRatio, zoomTransform.y * devicePixelRatio, 0]);
    m4.scale(zoomMatrix, [zoomTransform.k, zoomTransform.k, 1], zoomMatrix);

    // px/svg scale
    const centerSvgMatrix = m4.translation([visibleRectPt.cx, visibleRectPt.cy, 0]);
    m4.scale(centerSvgMatrix, [svgPxScaleUnzoomed, svgPxScaleUnzoomed, 1], centerSvgMatrix);
    const centerSvgMatrixWithoutVisibleScale = new Float32Array(centerSvgMatrix);
    m4.scale(centerSvgMatrix, [visibleScale, visibleScale, 1], centerSvgMatrix);
    const moveToCenter = [-svgWidth / 2, -svgHeight / 2, 0];
    m4.translate(centerSvgMatrix, moveToCenter, centerSvgMatrix);
    m4.translate(centerSvgMatrixWithoutVisibleScale, moveToCenter, centerSvgMatrixWithoutVisibleScale);

    // create matrices
    matrix = m4.ortho(0, canvasWidth, canvasHeight, 0, -1, 1);
    m4.multiply(matrix, zoomMatrix, matrix);
    m4.multiply(matrix, centerSvgMatrix, matrix);

    pxSvgMatrix = m4.scale(m4.identity(), [1 / devicePixelRatio, 1 / devicePixelRatio, 1]);
    svgPxUnzoomedMatrix = new Float32Array(pxSvgMatrix);
    m4.multiply(pxSvgMatrix, zoomMatrix, pxSvgMatrix);
    m4.multiply(pxSvgMatrix, centerSvgMatrix, pxSvgMatrix);
    m4.inverse(pxSvgMatrix, pxSvgMatrix);

    m4.multiply(svgPxUnzoomedMatrix, centerSvgMatrixWithoutVisibleScale, svgPxUnzoomedMatrix);

    ptscale = 1 / svgPxScale / zoomTransform.k;

    fireMatrixChange();
    if (prevPtscale !== ptscale) {
        firePtscaleChange();
        prevPtscale = ptscale;
    }
}