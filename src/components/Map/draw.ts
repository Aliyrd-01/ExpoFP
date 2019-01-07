import { svgWidth, svgHeight } from '@/tools/svg'
// import * as twgl from 'twgl.js'
import { m4 } from 'twgl.js'
import { drawBg } from './draw-bg'
import { drawBooths } from './draw-booths'
// import { drawText } from './draw-text'
// import { drawLabels } from './draw-labels'
// import { drawWalls } from './draw-walls'
import settings from '@/settings';

let canvas: HTMLCanvasElement;
let gl: WebGLRenderingContext;

let zoomTranform: ZoomTranform = { k: 1, x: 0, y: 0 };

type ZoomTranform = { k: number, x: number, y: number };

export function applyZoomTransform(transform: { k: number, x: number, y: number }) {
    zoomTranform = transform;
    requireRedraw();
}


// let animatedFrame: number;
export function requireRedraw() {
    // if (animatedFrame) window.cancelAnimationFrame(animatedFrame);
    // animatedFrame = window.requestAnimationFrame(draw);
}

let then = 0;
// const fpsTarget = 

function draw(now) {
    now *= 0.001;
    const deltaTime = now - then;
    then = now;
    const fps = 1 / deltaTime;
    document.getElementById("fps").innerHTML = fps.toFixed(1);


    // canvas/webgl scale
    let matrix = m4.ortho(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);
    // const browserPxMatrix = m4.scale(matrix, [devicePixelRatio, devicePixelRatio, 1]);
    // const browserScale = [browserPxMatrix[0], browserPxMatrix[5]];
    // px/webgl scale
    // const pxScale = [2 * devicePixelRatio / gl.canvas.width, -2 * devicePixelRatio/ gl.canvas.height];
    
    //const pxScale = [2 / gl.canvas.width, -2/ gl.canvas.height];

    // apply zoom first
    matrix = m4.translate(matrix, [zoomTranform.x * devicePixelRatio, zoomTranform.y * devicePixelRatio, 0]);
    matrix = m4.scale(matrix, [zoomTranform.k, zoomTranform.k, 1]);


    matrix = m4.translate(matrix, [gl.canvas.width / 2, gl.canvas.height / 2, 0]);
    // matrix = m4.scale(matrix, [devicePixelRatio, devicePixelRatio, 1]);


    // px/svg scale
    const scale = Math.min(gl.canvas.width / svgWidth, gl.canvas.height / svgHeight) * 0.95;
    // svg/px scale
    // const svgPxScale = [1 / scale / pxScale[0], 1 / scale / pxScale[1]];
    // const scale = 1.7;

    matrix = m4.scale(matrix, [scale, scale, 1]);
    matrix = m4.translate(matrix, [-svgWidth / 2, -svgHeight / 2, 0]);

    // scale of CSS px -> projection
    //const scaleX
    gl.clearColor(0.921, 0.921, 0.921, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    drawBg(gl, matrix);
    drawBooths(gl, matrix,  1 / scale / zoomTranform.k); //pxScale, * devicePixelRatio
    // drawText(gl, matrix, pxScale);
    // drawWalls(gl, matrix);
    // drawLabels(gl, matrix, browserScale, zoomTranform.k);

    requestAnimationFrame(draw);
    // gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
}

export function initialize(canvasParam: HTMLCanvasElement) {
    // draw all booths for now
    canvas = canvasParam;
    sizeCanvases();
    const options = {};// { premultipliedAlpha: false };
    gl = canvas.getContext("webgl", options) || canvas.getContext("experimental-webgl", options) as any;
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true as any);

    requestAnimationFrame(draw);
}


function sizeCanvases() {
    const bWidth = canvas.parentElement.clientWidth;
    const bHeight = canvas.parentElement.clientHeight;
    const cWidth = bWidth * devicePixelRatio;
    const cHeight = bHeight * devicePixelRatio;

    if (canvas.clientWidth !== bWidth || canvas.clientHeight !== bHeight) {
        console.log('Setting canvas style width/height');

        canvas.style.width = bWidth + 'px';
        canvas.style.height = bHeight + 'px';
    }

    if (cWidth !== canvas.width || cHeight !== canvas.height) {
        canvas.width = cWidth;
        canvas.height = cHeight;
    }
}
