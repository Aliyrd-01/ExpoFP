import { svgWidth, svgHeight } from '@/tools/svg'
// import * as twgl from 'twgl.js'
import { m4 } from 'twgl.js'
import { drawBooths } from './draw-booths'
import settings from '@/settings';

let canvas: HTMLCanvasElement;
let gl: WebGLRenderingContext;

let zoomTranform: ZoomTranform = { k: 1, x: 0, y: 0 };

type ZoomTranform = { k: number, x: number, y: number };

export function applyZoomTransform(transform: { k: number, x: number, y: number }) {
    zoomTranform = transform;
    requireRedraw();
}


let animatedFrame: number;
export function requireRedraw() {
    if (animatedFrame) window.cancelAnimationFrame(animatedFrame);
    animatedFrame = window.requestAnimationFrame(draw);
}


function draw() {
    let matrix = m4.ortho(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);

    // apply zoom first
    matrix = m4.translate(matrix, [zoomTranform.x * devicePixelRatio, zoomTranform.y * devicePixelRatio, 0]);
    matrix = m4.scale(matrix, [zoomTranform.k, zoomTranform.k, 1]);

    matrix = m4.translate(matrix, [gl.canvas.width / 2, gl.canvas.height / 2, 0]);
    // matrix = m4.scale(matrix, [devicePixelRatio, devicePixelRatio, 1]);


    const scale = Math.min(gl.canvas.width / svgWidth, gl.canvas.height / svgHeight) * 0.95;
    // const scale = 1.7;

    matrix = m4.scale(matrix, [scale, scale, 1]);
    matrix = m4.translate(matrix, [-svgWidth / 2, -svgHeight / 2, 0]);

  
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawBooths(gl, matrix);
    // gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
}

export function initialize(canvasParam: HTMLCanvasElement) {
    // draw all booths for now
    canvas = canvasParam;
    sizeCanvases();
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    draw();
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
