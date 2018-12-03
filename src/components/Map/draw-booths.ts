import * as twgl from 'twgl.js'

const vertexShaderSource = `
attribute vec4 a_center;
attribute vec4 a_delta;
uniform mat4 u_matrix;    
void main() {
    gl_Position = u_matrix * a_center;// + a_delta;
}`;

const fragmentSharedSource = `precision mediump float;
void main() {
    gl_FragColor = vec4(1, 0, 0.5, 1);
}`;


let programInfo: any;
let bufferInfo: any;

function initialize(gl: WebGLRenderingContext) {
    programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentSharedSource]);

    const booths = store.getters.boothsArray as Booth[];
    const centers = [];
    const deltas = [];
    const indeces = [];

    function addRect(cx, cy) {
        const w = 0.05;
        const h = 0.05;

        centers.push(cx, cy);
        deltas.push(-w, -h);

        centers.push(cx, cy);
        deltas.push(w, -h);

        centers.push(cx, cy);
        deltas.push(-w, h);

        centers.push(cx, cy);
        deltas.push(w, h);

        indeces.push(0, 1, 2, 1, 2, 3);
    }

    for (const b of booths) {
        addRect(b.rect.cx, b.rect.cy);
    }

    const arrays = {
        a_center: { numComponents: 2, data: centers },
        a_delta: {numComponents: 2, data : deltas},
        // texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1], },
        // normal: { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], },
        indices: { numComponents: 3, data: [0, 1, 2, 1, 2, 3], },
    };

    bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

    // const arrays = { a_position: { numComponents: 3, data: positions } };
    // bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
}

export function drawBooths(gl: WebGLRenderingContext, u_matrix: any) {
    // draw booths there
    if (!programInfo) initialize(gl);

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    const uniforms = { u_matrix };
    twgl.setUniforms(programInfo, uniforms);
    gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
}

