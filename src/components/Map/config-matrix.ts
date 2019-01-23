import { m4 } from 'twgl.js';
import { svgWidth, svgHeight } from '@/tools/svg';
import { delayAnimations, allDrawers, requireUpdate } from "./draw";
import animate from './animate';
import * as m from './matrix';

// let matrix: number[][];
// let pxSvgMatrix: number[][];
// let ptscale: number;
// let pxSvgScale: number;
// let dirty = true;
// let visibleScale = 0;
const maxVisibleScale = 0.95;
// const ptscaleChangeSubscribers: ((ptscale) => void)[] = [];

export default function configMatrix() {
    requireUpdate(update);
    m.subscribeMatrixChange(() => requireUpdate(update));
    // subscribeZoomDimensionsChange(() => { dirty = true; requireUpdate(update); });

    animate(delayAnimations, 1000, d3.easeExpOut, d3.interpolateNumber(0, maxVisibleScale), v => {
        // console.log(v);
        m.setVisbleScale(v);
        // visibleScale = v;
        // dirty = true;
        update();
    });
}


// export function subscribePtscaleChange(cb: (ptscale) => void) { ptscaleChangeSubscribers.push(cb); }
// export function getCurrentMatrixAndScale() { ensureMatrixAndScale(); return { matrix, ptscale, pxSvgMatrix, pxSvgScale } };
// function firePtscaleChange() { ptscaleChangeSubscribers.forEach(x => x(ptscale)); }

function update() {
    //ensureMatrixAndScale();
    for (const d of allDrawers) {
        d.matrix = m.getMatrix();
        d.ptscale = m.getPtscale();
    }
}

// let prevPtscale;
// function ensureMatrixAndScale() {
//     if (!dirty) return;
//     dirty = false;
//     const canvas = getCanvas();
//     const canvasWidth = canvas.width;
//     const canvasHeight = canvas.height;
//     const zoomTranform = getZoomTransform();
//     const visibleRect = getVisibleRect().scale(devicePixelRatio);

//     matrix = m4.ortho(0, canvasWidth, canvasHeight, 0, -1, 1);
//     pxSvgMatrix = m4.scale(m4.identity(), [1 / devicePixelRatio, 1 / devicePixelRatio, 1]);
//     // px/svg scale
//     pxSvgScale = Math.min(visibleRect.w / svgWidth, visibleRect.h / svgHeight) * visibleScale;

//     const matrices = [matrix, pxSvgMatrix];
//     const actions = [
//         [m4.translate, [zoomTranform.x * devicePixelRatio, zoomTranform.y * devicePixelRatio, 0]],
//         [m4.scale, [zoomTranform.k, zoomTranform.k, 1]],
//         [m4.translate, [visibleRect.cx, visibleRect.cy, 0]],
//         [m4.scale, [pxSvgScale, pxSvgScale, 1]],
//         [m4.translate, [-svgWidth / 2, -svgHeight / 2, 0]],
//     ];

//     // do the magic
//     actions.forEach(a => matrices.forEach(m => a[0](m, a[1], m)));

//     m4.inverse(pxSvgMatrix, pxSvgMatrix);

//     ptscale = 1 / pxSvgScale / zoomTranform.k;

//     if (prevPtscale !== ptscale) {
//         firePtscaleChange();
//         prevPtscale = ptscale;
//     }

//     //console.log('Matrix updated', canvasWidth, canvasHeight, zoomTranform, matrix, ptscale);
// }



