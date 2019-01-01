import * as twgl from 'twgl.js'
import Sprite, { createTextCanvas, SpriteItem } from './sprite'
import { getFont } from './utils';

const vertexShaderSource = `attribute vec4 a_position;
attribute vec2 a_texcoord;

//uniform mat4 u_matrix;

varying vec2 v_texcoord;

void main() {
    gl_Position = a_position;//u_matrix * 
    v_texcoord = a_texcoord;//position.xy;
}`;

const fragmentSharedSource = `precision mediump float;

varying vec2 v_texcoord;
uniform sampler2D u_texture;

void main() {
    gl_FragColor =  texture2D(u_texture, v_texcoord);//vec4(1.0,0.0,0.0,1.0);//
}`;


let programInfo: any;
// let bufferInfo: any;
let program: WebGLProgram;
let prevGl: any;
let positionLocation: number;
let positionBuffer: WebGLBuffer;

let texcoordLocation: number;
let texcoordBuffer: WebGLBuffer;
let numElements: number;
let texture: WebGLTexture;


function initialize(gl: WebGLRenderingContext) {
    prevGl = gl;
    programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentSharedSource]);
    program = programInfo.program;

    gl.useProgram(program);

    const positions = [
        -0.5, -0.5,
        -0.5, 0.5,
        0.5, -0.5,
        -0.5, 0.5,
        0.5, -0.5,
        0.5, 0.5,
    ];

    for(var i = 1; i < positions.length;i+=2){
        positions[i] = -positions[i];
    }

    const texcoords = [
        0, 0,
        0, 1,
        1, 0,
        0, 1,
        1, 0,
        1, 1
    ]


    positionLocation = gl.getAttribLocation(program, "a_position");
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    texcoordLocation = gl.getAttribLocation(program, "a_texcoord");
    texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);

    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true as any);
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // set it
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    //     new Uint8Array([0, 0, 255, 255]));

    // let's assume all images are not a power of 2
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    const img = makeTextCanvas('C07', gl.canvas.width/2, gl.canvas.height /2)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
}

export function drawText(gl: WebGLRenderingContext, u_matrix: any, u_pxscale: any) {
    // draw booths there 
    if (prevGl !== gl) initialize(gl);

    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.enableVertexAttribArray(texcoordLocation);
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);




    // twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    // gl.enableVertexAttribArray(centerLocation);
    // gl.vertexAttribPointer(centerLocation, 2, gl.FLOAT, false, 0, 0);


    //twgl.setUniforms(programInfo, { u_matrix, u_pxscale, u_texture: texture });

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    // gl.blendFunc(gl.SRC_COLOR, gl.DST_COLOR);
    gl.depthMask(false);

    twgl.setUniforms(programInfo, { u_texture: texture });

    // gl.drawArrays(gl.TRIANGLES, 0, numElements )
    // gl.drawElements(gl.TRIANGLES, numElements, gl.UNSIGNED_SHORT, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.disable(gl.BLEND);
}

const canvas = document.createElement("canvas")
const c = canvas.getContext("2d");
canvas.width = 100;
canvas.height = 100;

c.fillStyle = '#f00';
c.fillRect(0, 0, 100, 100);

debugCanvases.push(canvas);


var textCtx = document.createElement("canvas").getContext("2d");

// Puts text in center of canvas.
function makeTextCanvas(text, width, height) {
    textCtx.canvas.width = width;
    textCtx.canvas.height = height;
    textCtx.font = getFont(16 * devicePixelRatio, 400);//"64px monospace";
    textCtx.textAlign = "center";
    textCtx.textBaseline = "middle";

    textCtx.clearRect(0, 0, textCtx.canvas.width, textCtx.canvas.height);
    // textCtx.fillStyle = "#000";
    // textCtx.fillRect(0, 0, textCtx.canvas.width, textCtx.canvas.height);
    textCtx.fillStyle = "#fff";
    textCtx.fillText(text, width / 2, height / 2);
    return textCtx.canvas;
}
