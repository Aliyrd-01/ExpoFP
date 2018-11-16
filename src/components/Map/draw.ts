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
let textProgramInfo: any;
let textBufferInfo: any;
let textUniforms: any;
let textWidth, textHeight;

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

    textProgramInfo = twgl.createProgramInfo(gl, [textVertexShaderSource, textFragmentSharedSource]);
    textBufferInfo = primitives.createPlaneBufferInfo(gl, 1, 1, 1, 1, m4.rotationX(Math.PI / 2));

    var textCanvas = makeTextCanvas("Hello!", 100, 26);
    textWidth = textCanvas.width;
    textHeight = textCanvas.height;
    var textTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
    // make sure we can render it even if it's not a power of 2
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    textUniforms = {
        u_matrix: m4.identity(),
        u_texture: textTex,
    };

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

    // gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);

      // use just the view position of the 'F' for the text
      var textMatrix = m4.identity();// .ortho(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);
    // scale the F to the size we need it.
    // textMatrix = m4.scale(textMatrix, textWidth, textHeight, 1);

    // setup to draw the text.
    gl.useProgram(textProgramInfo.program);

    twgl.setBuffersAndAttributes(gl, textProgramInfo, textBufferInfo);

    m4.copy(textMatrix, textUniforms.u_matrix);
    twgl.setUniforms(textProgramInfo, textUniforms);

    // Draw the text.
    gl.drawElements(gl.TRIANGLES, textBufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
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
const textCtx = document.createElement("canvas").getContext("2d");
function makeTextCanvas(text, width, height): HTMLCanvasElement {
    textCtx.canvas.width = width;
    textCtx.canvas.height = height;
    textCtx.font = "20px monospace";
    textCtx.textAlign = "center";
    textCtx.textBaseline = "middle";
    textCtx.fillStyle = "black";
    textCtx.clearRect(0, 0, textCtx.canvas.width, textCtx.canvas.height);
    textCtx.fillText(text, width / 2, height / 2);
    return textCtx.canvas;
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


const textVertexShaderSource = `attribute vec4 position;
attribute vec2 texcoord;
uniform mat4 u_matrix;
varying vec2 v_texcoord;

void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * position;

  // Pass the texcoord to the fragment shader.
  v_texcoord = texcoord;
}`;

const textFragmentSharedSource = `precision mediump float;
// Passed in from the vertex shader.
varying vec2 v_texcoord;
uniform sampler2D u_texture;

void main() {
   gl_FragColor = texture2D(u_texture, v_texcoord);// + vec4(1,0,0,1);
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

