import { svgWidth, svgHeight } from '@/tools/svg'
import * as twgl from 'twgl.js'
import { m4 } from 'twgl.js'
import { drawBooths } from './draw-booths'
// import { getFpDestinationRectangle } from './utils';
// import c from './drawing-context'
// import { drawFpGrid, drawDebug } from './draw-debug';
import settings from '@/settings';
// import { createShader, createProgram } from './utils';
// import { drawSprites } from './draw-sprites';
// export { getBoothIdFromClientXy } from './booth-by-xy';

let canvas: HTMLCanvasElement;
let gl: WebGLRenderingContext;
// let programInfo: any;
// let matrixUniformLocation: WebGLUniformLocation;
let zoomTranform: ZoomTranform = { k: 1, x: 0, y: 0 };

type ZoomTranform = { k: number, x: number, y: number };

export function applyZoomTransform(transform: { k: number, x: number, y: number }) {
    zoomTranform = transform;
    requireRedraw();
}


// initialized:
// canvas
// gl

const width = svgWidth;
const height = svgHeight;
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

console.log(positions);

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


    const scale = Math.min(gl.canvas.width / width, gl.canvas.height / height) * 0.95;
    // const scale = 1.7;

    matrix = m4.scale(matrix, [scale, scale, 1]);
    matrix = m4.translate(matrix, [-width / 2, -height / 2, 0]);

    // apply the d3 translate and zoom



    // // translate the unit quad to the center 
    // matrix = m4.translate(matrix, [width / 2, height / 2, 0]);
    // // make the unit quad be half the size of the canvas
    // matrix = m4.scale(matrix, [width / 2, height / 2 , 1]);

    // gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);
    // gl.clear(gl.COLOR_BUFFER_BIT);
    // gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);

    // const uniforms = {
    //     u_matrix: matrix,
    // };

    // gl.useProgram(programInfo.program);
// 
    // twgl.setUniforms(programInfo, uniforms);
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawBooths(gl, matrix);
    // gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
}

export function initialize(canvasParam: HTMLCanvasElement) {
    // draw all booths for now
    canvas = canvasParam;
    sizeCanvases();
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");


    // programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentSharedSource]);

    // const arrays = { a_position: { numComponents: 2, data: positions } };
    // const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

    // gl.useProgram(programInfo.program);
    // twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

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
