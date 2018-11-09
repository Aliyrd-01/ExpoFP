import { svgWidth, svgHeight } from '@/tools/svg'
import * as twgl from 'twgl.js'
import { m4 } from 'twgl.js'
// import { getFpDestinationRectangle } from './utils';
// import c from './drawing-context'
// import { drawFpGrid, drawDebug } from './draw-debug';
import settings from '@/settings';
import { createShader, createProgram } from './utils';
// import { drawSprites } from './draw-sprites';
// export { getBoothIdFromClientXy } from './booth-by-xy';

let canvas: HTMLCanvasElement;
let gl: WebGLRenderingContext;
let programInfo: any;
let matrixUniformLocation: WebGLUniformLocation;
let zoomTranform: ZoomTranform = { k: 1, x: 0, y: 0 };

type ZoomTranform = { k: number, x: number, y: number };

export function applyZoomTransform(transform: { k: number, x: number, y: number }) {
    zoomTranform = transform;
    requireRedraw();
}

const vertexShaderSource = `attribute vec4 a_position;
uniform mat4 u_matrix;    
void main() {
    gl_Position = u_matrix * a_position;
}`;

const fragmentSharedSource = `precision mediump float;
void main() {
    gl_FragColor = vec4(1, 0, 0.5, 1);
}`;

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

    const uniforms = {
        u_matrix: matrix,
    };

    twgl.setUniforms(programInfo, uniforms);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
}

export function initialize(canvasParam: HTMLCanvasElement) {
    // draw all booths for now
    canvas = canvasParam;
    sizeCanvases();
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");


    programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentSharedSource]);

    const arrays = { a_position: positions, };
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

    // define some shader programs, etc

    // const vertexShader = createShader(gl, gl.VERTEX_SHADER, `attribute vec4 a_position;
    // uniform mat4 matrix;    
    // void main() {
    //     gl_Position = matrix * a_position;
    // }`);

    // const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, `precision mediump float;
    // void main() {
    //     gl_FragColor = vec4(1, 0, 0.5, 1);
    // }`);

    // const program = createProgram(gl, vertexShader, fragmentShader);

    // matrixUniformLocation = gl.getUniformLocation(program, 'matrix');
    // const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    // const positionBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // gl.useProgram(program);
    // gl.enableVertexAttribArray(positionAttributeLocation);

    // gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    // const textVertexShared = createShader(gl, gl.VERTEX_SHADER, `attribute vec4 a_position;
    // attribute vec2 a_texcoord;

    // uniform mat4 u_matrix;

    // varying vec2 v_texcoord;

    // void main() {
    //     // Multiply the position by the matrix.
    //     gl_Position = u_matrix * a_position;

    //     // Pass the texcoord to the fragment shader.
    //     v_texcoord = a_texcoord;
    // }
    // `);
    // const textFragmentShared = createShader(gl, gl.FRAGMENT_SHADER, `
    // precision mediump float;

    // // Passed in from the vertex shader.
    // varying vec2 v_texcoord;

    // uniform sampler2D u_texture;

    // void main() {
    //    gl_FragColor = texture2D(u_texture, v_texcoord);// + vec4(1,0,0,1);
    // }
    // `);


    // var textCanvas = makeTextCanvas("Hello!", 100, 26);
    // var textWidth = textCanvas.width;
    // var textHeight = textCanvas.height;
    // var textTex = gl.createTexture();
    // gl.bindTexture(gl.TEXTURE_2D, textTex);
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
    // // make sure we can render it even if it's not a power of 2
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // const textProgram = createProgram(gl, textVertexShared, textFragmentShared);

    draw();
    // set_transform(1, 0, 0);
    // // gl.drawArrays(gl.TRIANGLES, 0, 3);

    // function set_transform(k, tx, ty) {


    //     // change the space to be pixels with 0,0 in top left


    // }
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

var textCtx = document.createElement("canvas").getContext("2d");

// Puts text in center of canvas.
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