import * as twgl from 'twgl.js'
import { getFont } from './utils';

const vertexShaderSource = `
// attribute vec2 a_position1;
// attribute vec2 a_position2;
attribute float a_vertex_index;
// just draw rect

// attribute vec2 a_center;
// attribute vec2 a_delta;
// attribute vec2 a_texcoord;
// varying vec2 v_texcoord;
//uniform mat4 u_matrix;    
//uniform vec2 u_bscale; 
void main() {
    if (a_vertex_index == 0.0) {
        gl_Position = vec4(-0.5, -0.5,0,0);
    } else if (a_vertex_index == 1.0) {
        gl_Position = vec4(-0.5, 0.5,0,0);
    } else  {
        gl_Position = vec4(0.5, -0.5,0,0);
    }
   // u_matrix * vec4(a_center, 0, 1) + vec4(a_delta * u_bscale, 0, 0);

    // v_texcoord = a_texcoord;
}`;

const fragmentSharedSource = `
precision mediump float;
// varying vec2 v_texcoord;
// uniform sampler2D u_texture1;
// uniform sampler2D u_texture2;
void main() {
    gl_FragColor = vec4(1.0,0.0,0.0,1.0);
}`;


let programInfo: any;
let bufferInfo: any;
let prevGl: any;
let texture1: WebGLTexture;

function initialize(gl: WebGLRenderingContext) {
    prevGl = gl;
    programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentSharedSource]);

    const booths = store.getters.boothsArray as Booth[];
    const positions1 = [];
    const positions2 = [];
    const vertex_indexes = [];
    // const centers = [];
    // const deltas = [];
    // const textcoords = [];
    const indices = [];
    // const positions = [];

    const fontSize = 28;// browser pixels
    // const lineHeight = fontSize;
    // const lineWidth = 100;
    // // render texture for all booth names
    const textureFontSize = fontSize * devicePixelRatio;
    // const textureLineHeight = fontSize * devicePixelRatio;
    // const textureLineWidth = lineWidth * devicePixelRatio;

    // const columns = 2;

    const boothNames = booths.map(b => b.name);
    const canvasData = createTextCanvas(boothNames, textureFontSize);


    let i = 0;
    // let total = boothNames.length;
    // let textureStep = 1 / total;


    function addRect(b:Booth) {
        const {cx, cy} = b.rect;
        const data = canvasData.info.get(b.name);
        const dr = data.rect;

        const w = data.widthPx / 2 / devicePixelRatio;
        const h = data.heightPx / 2/ devicePixelRatio;
        const k = i * 4;
        // let row = i;
        // let col = 0;
        // if (n >= boothNames.length){
        //     n = n % boothNames.length;
        // }
        // const t0y = row * textureStep;
        // const t1y = (row + 1) * textureStep;


        // // positions.push(r.x1, r.y1)
        // centers.push(cx, cy);
        // deltas.push(-w, -h);
        // textcoords.push(dr.x1, dr.y1);

        // // positions.push(r.x2, r.y1)
        // centers.push(cx, cy);
        // deltas.push(w, -h);
        // textcoords.push(dr.x2, dr.y1);

        // // positions.push(r.xt1, r.y2)
        // centers.push(cx, cy);
        // deltas.push(-w, h);
        // textcoords.push(dr.x1, dr.y2);

        // // positions.push(r.x2, r.y2)
        // centers.push(cx, cy);
        // deltas.push(w, h);
        // textcoords.push(dr.x2, dr.y2);

        // positions1.push(b.rect.x1, b.rect.y1);
        // positions1.push(b.rect.x1, b.rect.y1);
        // positions1.push(b.rect.x1, b.rect.y1);
        // positions1.push(b.rect.x1, b.rect.y1);

        // positions2.push(b.rect.x2, b.rect.y2);
        // positions2.push(b.rect.x2, b.rect.y2);
        // positions2.push(b.rect.x2, b.rect.y2);
        // positions2.push(b.rect.x2, b.rect.y2);

        vertex_indexes.push(0, 1, 2);

        // indices.push(k + 0, k + 1, k + 2, k + 1, k + 2, k + 3);

        i++;
    }

    for (const b of booths) {//.filter((b, i) => i < 100)
        // addRect(b);
    }

    vertex_indexes.push(0, 1, 2);

    const arrays = {
        // a_position1: { numComponents: 2, data: positions1 },
        // a_position2: { numComponents: 2, data: positions2 },
        a_vertex_index: { numComponents: 1, data: vertex_indexes },
        // a_delta: { numComponents: 2, data: deltas },
        // a_texcoord: { numComponents: 2, data: textcoords },
        //a_position: { numComponents: 2, data: positions },
        // indices: { numComponents: 3, data: indices, },
    };

    bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
    

    // texture1 = gl.createTexture();
    // gl.bindTexture(gl.TEXTURE_2D, texture1);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvasData.canvas);

}

export function drawLabels(gl: WebGLRenderingContext, u_matrix: any, u_bscale: any, zoomScale: number) {
    // draw booths there
    if (prevGl !== gl) initialize(gl);

    gl.useProgram(programInfo.program);
    // twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

    const idxLocation = gl.getAttribLocation(programInfo.program, "a_vertex_index");


    // let factor = 0.25;
    // if (zoomScale > 2) {
    //     factor = 0.5;
    // }
    // if (zoomScale > 3) {
    //     factor = 1;
    // }

    // u_bscale = [u_bscale[0] * factor, u_bscale[1] * factor];

    // const uniforms = { u_matrix, u_bscale };
    // twgl.setUniforms(programInfo, uniforms);

    // gl.enable(gl.BLEND);
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // gl.depthMask(false);
    const idxBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, idxBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,1,2]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, idxBuffer);
    gl.enableVertexAttribArray(idxLocation);
    gl.vertexAttribPointer(idxLocation, 1, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    //gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);

    // gl.disable(gl.BLEND);
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // gl.depthMask(true);
}





function createTextCanvas(lines: string[], fontSize: number) {
    // unique
    lines = Array.from(new Set(lines));

    const cols = 5;
    const rows = Math.ceil(lines.length / cols);
    const cellHeight = fontSize;
    const maxColWidth = 200 * devicePixelRatio;

    const canvas = document.createElement("canvas")
    const c = canvas.getContext("2d");
    c.font = getFont(fontSize, 400);
    const cellWidth = Math.min(maxColWidth, Math.max(...lines.map(l => c.measureText(l).width)));
    const width = cols * cellWidth;
    const height = rows * cellHeight;
    canvas.width = width;
    canvas.height = height;

    c.font = getFont(fontSize, 400);
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle = "#fff";

    const info = new Map<string, {rect:Rect, widthPx: number, heightPx: number}>();

    for (let i = 0; i < lines.length; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x1 = col * cellWidth;
        const y1 = row * cellHeight;

        const r = Rect.fromXywh(x1, y1, cellWidth, cellHeight);
        const text = lines[i];
        c.fillText(text, r.cx, r.cy);
        info.set(text, { rect: r.normalize(width, height), widthPx: cellWidth, heightPx: cellHeight })
    }

    debugCanvases.push(canvas);
    return { canvas, info };
}