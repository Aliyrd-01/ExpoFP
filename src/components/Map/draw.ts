import { svgWidth, svgHeight } from '@/tools/svg'
import * as twgl from 'twgl.js'
import { m4, primitives } from 'twgl.js'
// import { getFpDestinationRectangle } from './utils';
// import c from './drawing-context'
// import { drawFpGrid, drawDebug } from './draw-debug';
// import settings from '@/settings';
// import { createShader, createProgram } from './utils';
// import { drawSprites } from './draw-sprites';
// export { getBoothIdFromClientXy } from './booth-by-xy';

const width = svgWidth;
const height = svgHeight;

let gl: WebGLRenderingContext;
let boothsProgramInfo: any;
let boothsBufferInfo: any;

let zoomTranform: ZoomTranform = { k: 1, x: 0, y: 0 };
type ZoomTranform = { k: number, x: number, y: number };
// let boothsBufferInfo: any;
// let boothsBufferInfo: any;


export function initialize(canvas: HTMLCanvasElement) {
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    sizeCanvases();
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    console.log(positions);
    boothsProgramInfo = twgl.createProgramInfo(gl, [boothsVertexShaderSource, boothsFragmentSharedSource]);
    boothsBufferInfo = twgl.createBufferInfoFromArrays(gl, { a_position: { numComponents: 2, data: positions } });

    requireRedraw()
}

function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    let matrix = m4.ortho(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);
    matrix = m4.translate(matrix, [zoomTranform.x * devicePixelRatio, zoomTranform.y * devicePixelRatio, 0]);
    matrix = m4.scale(matrix, [zoomTranform.k, zoomTranform.k, 1]);
    matrix = m4.translate(matrix, [gl.canvas.width / 2, gl.canvas.height / 2, 0]);
    const scale = Math.min(gl.canvas.width / width, gl.canvas.height / height) * 0.95;
    matrix = m4.scale(matrix, [scale, scale, 1]);
    matrix = m4.translate(matrix, [-width / 2, -height / 2, 0]);

    gl.useProgram(boothsProgramInfo.program);
    twgl.setBuffersAndAttributes(gl, boothsProgramInfo, boothsBufferInfo);
    twgl.setUniforms(boothsProgramInfo, { u_matrix: matrix });

    gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
}


/////////////////////////////////
// helper functions
function sizeCanvases() {
    const canvas = gl.canvas;
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


export function applyZoomTransform(transform: { k: number, x: number, y: number }) {
    zoomTranform = transform;
    requireRedraw();
}

let animatedFrame: number;
export function requireRedraw() {
    if (animatedFrame) window.cancelAnimationFrame(animatedFrame);
    animatedFrame = window.requestAnimationFrame(draw);
}

const boothsVertexShaderSource = `attribute vec4 a_position;
uniform mat4 u_matrix;    
void main() {
    gl_Position = u_matrix * a_position;
}`;

const boothsFragmentSharedSource = `precision mediump float;
void main() {
    gl_FragColor = vec4(1, 0, 0.5, 1);
}`;


//////////////////////////////////////////////////////////////////
// Data
const booths = store.getters.boothsArray as Booth[];

const positions = [];

function addRect(x1, x2, y1, y2) {
    positions.push(x1, y1);
    positions.push(x2, y1);
    positions.push(x1, y2);

    positions.push(x2, y1);
    positions.push(x1, y2);
    positions.push(x2, y2);
}

// addRect(0, width / 3, 0, height / 3);
// addRect(width / 2, height / 2, width, height);

for (const b of booths) {
    addRect(b.rect.x1, b.rect.x2, b.rect.y1, b.rect.y2);
}

