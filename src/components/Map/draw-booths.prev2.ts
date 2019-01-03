import * as twgl from 'twgl.js'
import Sprite, { createTextCanvas, SpriteItem } from './sprite'

const vertexShaderSource = `//attribute vec2 a_position1;
attribute vec2 a_center;
attribute vec2 a_rotate;
attribute vec2 a_delta;
attribute vec2 a_deltapx;
attribute vec4 a_color;
attribute vec2 a_texcoord;
uniform mat4 u_matrix;   
uniform vec2 u_pxscale; 
varying vec2 v_texcoord;
varying vec4 v_color;

void main() {
    vec2 delta = a_delta + a_deltapx * u_pxscale;
    vec2 rotatedDelta =  vec2(
        delta.x * a_rotate.y + delta.y * a_rotate.x,
        delta.y * a_rotate.y - delta.x * a_rotate.x);
    gl_Position = u_matrix * vec4(a_center + rotatedDelta, 0, 1);
    v_texcoord = a_texcoord;//vec2(0,0);
    v_color = a_color;
}`;

const fragmentSharedSource = `precision mediump float;
varying vec2 v_texcoord;
varying vec4 v_color;
uniform sampler2D u_texture;

void main() {
    //41B6E7
    if (v_color.w != 0.0){
        gl_FragColor = v_color; //vec4(65.0/ 255.0, 182.0/ 255.0, 231.0/ 255.0, 1);
    } else {
        gl_FragColor = texture2D(u_texture, v_texcoord);
    }
}`;


let programInfo: any;
// let bufferInfo: any;
let program: WebGLProgram;
let prevGl: any;
// let positionLocation: number;
// let positionBuffer: WebGLBuffer;
// let positionsArray: Float32Array;
let centerLocation: number;
let deltaLocation: number;
let deltapxLocation: number;
let colorLocation: number;
let rotateLocation: number;
let texcoordLocation: number;

let centerBuffer: WebGLBuffer;
let deltaBuffer: WebGLBuffer;
let deltapxBuffer: WebGLBuffer;
let colorBuffer: WebGLBuffer;
let rotateBuffer: WebGLBuffer;
let texcoordBuffer: WebGLBuffer;
let indexBuffer: WebGLBuffer;
let numElements: number;
let texture: WebGLTexture;

const sprite = new Sprite();

// let centerArray: Float32Array;


function initialize(gl: WebGLRenderingContext) {
    prevGl = gl;
    programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentSharedSource]);
    program = programInfo.program;

    gl.useProgram(program);


    const booths = store.getters.boothsArray as Booth[];
    // const positions = [];

    // function addRect(x1, x2, y1, y2) {
    //     positions.push(x1, y1);
    //     positions.push(x2, y1);
    //     positions.push(x1, y2);

    //     positions.push(x2, y1);
    //     positions.push(x1, y2);
    //     positions.push(x2, y2);
    // }

    // for (const b of booths) {
    //     addRect(b.rect.x1, b.rect.x2, b.rect.y1, b.rect.y2);
    // }

    // positionLocation = gl.getAttribLocation(program, 'a_position1');
    // positionBuffer = gl.createBuffer();
    // positionsArray = new Float32Array(positions);

    // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, positionsArray, gl.STATIC_DRAW);

    // TODO: covert to draw-elements (use indices)
    // NEW BUFFERS
    const centers = [];
    const deltas = [];
    const deltapxs = [];
    const indices = [];
    const colors = [];
    const rotates = [];
    const texItems = [] as SpriteItem[];
    //const texcoords = [];
    //const rotates = [];

    const angleInRadians = 5 * Math.PI / 180;
    const r0 = Math.sin(angleInRadians);
    const r1 = Math.cos(angleInRadians);

    for (const b of booths) {
        const r = b.rect;
        const i = centers.length / 2;
        // 4 vertices per booth
        centers.push(r.cx, r.cy, r.cx, r.cy, r.cx, r.cy, r.cx, r.cy);
        deltas.push(-r.w / 2, -r.h / 2, r.w / 2, -r.h / 2, -r.w / 2, r.h / 2, r.w / 2, r.h / 2);
        deltapxs.push(0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5);
        for (let k = 1; k < 5; k++) colors.push(65.0 / 255.0 / k, 182.0 / 255.0 / k, 231.0 / 255.0 / k, 1);
        for (let k = 1; k < 5; k++) rotates.push(r0, r1);
        texItems.push(null);
        //texcoords.push(0, 0, 0, 0, 0, 0, 0, 0);
        // TODO: add rotates and further, read about rotates
        //for (let k = 1; k < 5; k++) colors.push(65.0 / 255.0 / k, 182.0 / 255.0 / k, 231.0 / 255.0 / k, 1);

        // what to draw
        indices.push(i, i + 1, i + 2, i + 1, i + 2, i + 3);
    }

    // add labels
    for (const b of booths) {
        const r = b.rect;
        const i = centers.length / 2;

        const upscale = 1;
        const canvas = createTextCanvas(b.name, 16 * upscale * devicePixelRatio);
        const w = canvas.width / devicePixelRatio / 2 / upscale;
        const h = canvas.height / devicePixelRatio / 2 / upscale;

        // 4 vertices per booth
        centers.push(r.cx, r.cy, r.cx, r.cy, r.cx, r.cy, r.cx, r.cy);
        deltas.push(0, 0, 0, 0, 0, 0, 0, 0);
        deltapxs.push(-w, -h, w, -h, -w, h, w, h);
        for (let k = 1; k < 5; k++) colors.push(1 / k, 0 / k, 0 / k, 0);
        for (let k = 1; k < 5; k++) rotates.push(r0, r1);

        const info = sprite.addCanvas(canvas);

        texItems.push(info);
        //textcoords.push()

        // what to draw
        indices.push(i, i + 1, i + 2, i + 1, i + 2, i + 3);
    }

    numElements = indices.length;

    centerLocation = gl.getAttribLocation(program, "a_center");
    centerBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, centerBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(centers), gl.STATIC_DRAW);

    deltaLocation = gl.getAttribLocation(program, "a_delta");
    deltaBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, deltaBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(deltas), gl.STATIC_DRAW);

    deltapxLocation = gl.getAttribLocation(program, "a_deltapx");
    deltapxBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, deltapxBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(deltapxs), gl.STATIC_DRAW);

    colorLocation = gl.getAttribLocation(program, "a_color");
    colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    rotateLocation = gl.getAttribLocation(program, "a_rotate");
    rotateBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, rotateBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rotates), gl.STATIC_DRAW);

    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sprite.generateSpriteCanvas());

    texcoordLocation = gl.getAttribLocation(program, "a_texcoord");
    texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    const texcoords = [];
    texItems.forEach(x => {
        if (x === null) texcoords.push(0, 0, 0, 0, 0, 0, 0, 0);
        else {
            const r = x.rect;
            texcoords.push(r.x1, r.y1, r.x2, r.y1, r.x1, r.y2, r.x2, r.y2);
        }
    });
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);


    // gl.enableVertexAttribArray(positionLocation);
    // gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // centerLocation = gl.getAttribLocation(program, 'a_center');
    // centerBuffer = gl.createBuffer();
    // centerArray = new Float32Array(positions);

    indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);





    // gl.enableVertexAttribArray(positionLocation);
    // gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, positionsArray, gl.DYNAMIC_DRAW);

    // const arrays = { a_position: { numComponents: 2, data: positions } };
    // bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
}

export function drawBooths(gl: WebGLRenderingContext, u_matrix: any, u_pxscale: any) {
    // draw booths there 
    if (prevGl !== gl) initialize(gl);

    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, centerBuffer);
    gl.enableVertexAttribArray(centerLocation);
    gl.vertexAttribPointer(centerLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, deltaBuffer);
    gl.enableVertexAttribArray(deltaLocation);
    gl.vertexAttribPointer(deltaLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, deltapxBuffer);
    gl.enableVertexAttribArray(deltapxLocation);
    gl.vertexAttribPointer(deltapxLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.enableVertexAttribArray(colorLocation);
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, rotateBuffer);
    gl.enableVertexAttribArray(rotateLocation);
    gl.vertexAttribPointer(rotateLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.enableVertexAttribArray(texcoordLocation);
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);




    // twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    // gl.enableVertexAttribArray(centerLocation);
    // gl.vertexAttribPointer(centerLocation, 2, gl.FLOAT, false, 0, 0);


    twgl.setUniforms(programInfo, { u_matrix, u_pxscale, u_texture: texture });

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // gl.blendFunc(gl.SRC_COLOR, gl.DST_COLOR);
    // gl.depthMask(false);

    // gl.drawArrays(gl.TRIANGLES, 0, numElements )
    gl.drawElements(gl.TRIANGLES, numElements, gl.UNSIGNED_SHORT, 0);
    gl.disable(gl.BLEND);
}

const canvas = document.createElement("canvas")
const c = canvas.getContext("2d");
canvas.width = 100;
canvas.height = 100;

c.fillStyle = '#f00';
c.fillRect(0, 0, 100, 100);

debugCanvases.push(canvas);
