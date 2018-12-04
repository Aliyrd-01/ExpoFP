import * as twgl from 'twgl.js'

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
let texture: WebGLTexture;

function initialize(gl: WebGLRenderingContext) {
    programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentSharedSource]);

    const booths = store.getters.boothsArray as Booth[];
    const centers = [];
    const deltas = [];
    const textcoords = [];
    const indices = [];
    // const positions = [];

    function addRect(cx, cy, r: Rect) {
        const w = 25;//r.w/2;
        const h = 5;//r.h/2;
        const k = centers.length / 2;

        // positions.push(r.x1, r.y1)
        centers.push(cx, cy);
        deltas.push(-w, -h);
        textcoords.push(0, 0);

        // positions.push(r.x2, r.y1)
        centers.push(cx, cy);
        deltas.push(w, -h);
        textcoords.push(1, 0);

        // positions.push(r.x1, r.y2)
        centers.push(cx, cy);
        deltas.push(-w, h);
        textcoords.push(0, 1);

        // positions.push(r.x2, r.y2)
        centers.push(cx, cy);
        deltas.push(w, h);
        textcoords.push(1, 1);


        indices.push(k + 0, k + 1, k + 2, k + 1, k + 2, k + 3);
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

    const c = makeTextCanvas("hello", 100, 20);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);

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

export function drawLabels(gl: WebGLRenderingContext, u_matrix: any, u_bscale: any) {
    // draw booths there
    if (!programInfo) initialize(gl);

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    const uniforms = { u_matrix, u_bscale, u_texture: texture };
    twgl.setUniforms(programInfo, uniforms);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);

    gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
}



var textCtx = document.createElement("canvas").getContext("2d");

// Puts text in center of canvas.
function makeTextCanvas(text, width, height) {
    textCtx.canvas.width = width;
    textCtx.canvas.height = height;
    textCtx.font = "20px monospace";
    textCtx.textAlign = "center";
    textCtx.textBaseline = "middle";

    // textCtx.clearRect(0, 0, textCtx.canvas.width, textCtx.canvas.height);
    // textCtx.fillStyle = "#00ff00";
    // textCtx.fillRect(0, 0, textCtx.canvas.width, textCtx.canvas.height);
    textCtx.fillStyle = "black";
    // textCtx.fillRect(2, 2, textCtx.canvas.width - 4, textCtx.canvas.height - 4);
    textCtx.fillText(text, width / 2, height / 2);
    return textCtx.canvas;
}