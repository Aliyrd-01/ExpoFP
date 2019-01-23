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
// svg -> browser point matrix (unzoomed)
let svgPxUnzoomedMatrix: number[][];

//
// dependencies and misc
//
let dirty = true;
let prevPtscale: number;

let canvasWidth: number;
let canvasHeight: number;
let visibleRect: Rect;
let visibleScale: number;
let zoomTransform: { x: number, y: number, k: number };


//
// setters
//
export function setZoomTransform(transform: typeof zoomTransform) {
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
// TODO: remove from here
export function getZoomTransform() { return zoomTransform; }

//
// subscribe
//
const ptscaleChangeSubscribers: ((ptscale:number) => void)[] = [];
export function subscribePtscaleChange(cb: (ptscale) => void) { ptscaleChangeSubscribers.push(cb); }
function firePtscaleChange() { ptscaleChangeSubscribers.forEach(x => x(ptscale)); }

const matrixChangeSubscribers: ((matrix:number[][]) => void)[] = [];
export function subscribeMatrixChange(cb: (ptscale:number[][]) => void) { matrixChangeSubscribers.push(cb); }
function fireMatrixChange() { matrixChangeSubscribers.forEach(x => x(matrix)); }


//
// core
//

function ensureAll() {
    if (!dirty) return;
    dirty = false;

    const vRect = visibleRect.scale(devicePixelRatio);

    matrix = m4.ortho(0, canvasWidth, canvasHeight, 0, -1, 1);
    pxSvgMatrix = m4.scale(m4.identity(), [1 / devicePixelRatio, 1 / devicePixelRatio, 1]);
    // px/svg scale
    pxSvgScale = Math.min(vRect.w / svgWidth, vRect.h / svgHeight) * visibleScale;

    const matrices = [matrix, pxSvgMatrix];
    const actions = [
        [m4.translate, [zoomTransform.x * devicePixelRatio, zoomTransform.y * devicePixelRatio, 0]],
        [m4.scale, [zoomTransform.k, zoomTransform.k, 1]],
        [m4.translate, [vRect.cx, vRect.cy, 0]],
        [m4.scale, [pxSvgScale, pxSvgScale, 1]],
        [m4.translate, [-svgWidth / 2, -svgHeight / 2, 0]],
    ];

    // do the magic
    actions.forEach(a => matrices.forEach(m => a[0](m, a[1], m)));

    m4.inverse(pxSvgMatrix, pxSvgMatrix);

    ptscale = 1 / pxSvgScale / zoomTransform.k;

    fireMatrixChange();
    if (prevPtscale !== ptscale) {
        firePtscaleChange();
        prevPtscale = ptscale;
    }
}