import * as twgl from 'twgl.js'
import { getFont } from './utils';

const vertexShaderSource = `
attribute vec2 a_center;
attribute vec2 a_delta;
attribute vec2 a_texcoord;
//attribute vec4 a_position;
varying vec2 v_texcoord;
uniform mat4 u_matrix;    
uniform vec2 u_bscale; 
void main() {
    gl_Position = u_matrix * vec4(a_center, 0, 1) + vec4(a_delta * u_bscale, 0, 0);
    v_texcoord = a_texcoord;
}`;

const fragmentSharedSource = `
precision mediump float;
varying vec2 v_texcoord;
uniform sampler2D u_texture;
void main() {
    gl_FragColor = texture2D(u_texture, v_texcoord);// vec4(1, 0, 0.5, 1);
}`;


let programInfo: any;
let bufferInfo: any;
let prevGl: any;
let texture: WebGLTexture;

function initialize(gl: WebGLRenderingContext) {
    prevGl = gl;
    programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentSharedSource]);

    const booths = store.getters.boothsArray as Booth[];
    const centers = [];
    const deltas = [];
    const textcoords = [];
    const indices = [];
    // const positions = [];

    const fontSize = 28;// browser pixels
    const lineHeight = fontSize;
    const lineWidth = 100;
    // render texture for all booth names
    const textureFontSize = fontSize * devicePixelRatio;
    const textureLineHeight = fontSize * devicePixelRatio;
    const textureLineWidth = lineWidth * devicePixelRatio;

    const columns = 2;

    const boothNames = booths.map(b => b.name);
    let i = 0;
    let total = boothNames.length;
    let textureStep = 1 / total;
    

    function addRect(cx, cy, r: Rect) {
        const w = lineWidth / 2;//r.w/2;
        const h = lineHeight / 2;//r.h/2;
        const k = i * 4;
        let row  = i;
        let col = 0;
        // if (n >= boothNames.length){
        //     n = n % boothNames.length;
        // }
        const t0y = row * textureStep;
        const t1y = (row+1) * textureStep;
        

        // positions.push(r.x1, r.y1)
        centers.push(cx, cy);
        deltas.push(-w, -h);
        textcoords.push(0, t0y);

        // positions.push(r.x2, r.y1)
        centers.push(cx, cy);
        deltas.push(w, -h);
        textcoords.push(1, t0y);

        // positions.push(r.xt1, r.y2)
        centers.push(cx, cy);
        deltas.push(-w, h);
        textcoords.push(0, t1y);

        // positions.push(r.x2, r.y2)
        centers.push(cx, cy);
        deltas.push(w, h);
        textcoords.push(1, t1y);


        indices.push(k + 0, k + 1, k + 2, k + 1, k + 2, k + 3);

        i++;
    }

    for (const b of booths) {//.filter((b, i) => i < 100)
        addRect(b.rect.cx, b.rect.cy, b.rect);
    }

    const arrays = {
        a_center: { numComponents: 2, data: centers },
        a_delta: { numComponents: 2, data: deltas },
        a_texcoord: { numComponents: 2, data: textcoords },
        //a_position: { numComponents: 2, data: positions },
        indices: { numComponents: 3, data: indices, },
    };

    bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

    texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);
    // set it
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    //     new Uint8Array([0, 0, 255, 255]));

    // let's assume all images are not a power of 2
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    const c = makeTextCanvas(boothNames, textureFontSize, textureLineWidth, textureLineHeight);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    // gl.generateMipmap(gl.TEXTURE_2D);
    // gl.generateMipmap(gl.TEXTURE_2D);

    // var img = new Image();
    // img.addEventListener('load', function () {

    //     texture = gl.createTexture();
    //     gl.bindTexture(gl.TEXTURE_2D, texture);

    //     // let's assume all images are not a power of 2
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    //     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    //     // gl.generateMipmap(gl.TEXTURE_2D);

    // });
    // img.src = '/resources/leaves.jpg';



    // const arrays = { a_position: { numComponents: 3, data: positions } };
    // bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
}

export function drawLabels(gl: WebGLRenderingContext, u_matrix: any, u_bscale: any, zoomScale: number) {
    // draw booths there
    if (prevGl !== gl) initialize(gl);

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    let factor = 0.25;
    if (zoomScale > 2){
        factor = 0.5;
    }
    if (zoomScale > 3){
        factor = 1;
    }
    
    u_bscale = [u_bscale[0] * factor, u_bscale[1] * factor];

    const uniforms = { u_matrix, u_bscale, u_texture: texture };
    twgl.setUniforms(programInfo, uniforms);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);

    gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);

    gl.disable(gl.BLEND);
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // gl.depthMask(true);
}



var textCtx = document.createElement("canvas").getContext("2d");

// Puts text in center of canvas.
function makeTextCanvas(lines: string[], fontSize, width, lineHeight) {
    textCtx.canvas.width = width;
    textCtx.canvas.height = lineHeight * lines.length;
    textCtx.font = getFont(fontSize, 400);
    textCtx.textAlign = "center";
    textCtx.textBaseline = "middle";

    // textCtx.clearRect(0, 0, textCtx.canvas.width, textCtx.canvas.height);
    // textCtx.fillStyle = "#00ff00";
    // textCtx.fillRect(0, 0, textCtx.canvas.width, textCtx.canvas.height);
    textCtx.fillStyle = "#fff";
    // textCtx.fillRect(2, 2, textCtx.canvas.width - 4, textCtx.canvas.height - 4);

    for (let i = 0; i < lines.length; i++) {
        textCtx.fillText(lines[i], width / 2, (i + 0.5) * lineHeight);
    }

    return textCtx.canvas;
}