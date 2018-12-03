import * as twgl from 'twgl.js'

const vertexShaderSource = `
attribute vec2 a_center;
attribute vec2 a_delta;
//attribute vec4 a_position;
uniform mat4 u_matrix;    
uniform vec2 u_bscale; 
void main() {
    gl_Position = u_matrix * vec4(a_center, 0, 1) + vec4(a_delta * u_bscale, 0, 0);
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
    const indices = [];
    // const positions = [];

    function addRect(cx, cy, r: Rect) {
        const w = 2;//r.w/2;
        const h = 2;//r.h/2;
        const k = centers.length / 2;

        // positions.push(r.x1, r.y1)
        centers.push(cx, cy);
        deltas.push(-w, -h);

        // positions.push(r.x2, r.y1)
        centers.push(cx, cy);
        deltas.push(w, -h);

        // positions.push(r.x1, r.y2)
        centers.push(cx, cy);
        deltas.push(-w, h);

        // positions.push(r.x2, r.y2)
        centers.push(cx, cy);
        deltas.push(w, h);

        indices.push(k + 0, k + 1, k + 2, k + 1, k + 2, k + 3);
    }

    for (const b of booths) {//.filter((b, i) => i < 100)
        addRect(b.rect.cx, b.rect.cy, b.rect);
    }

    const arrays = {
        a_center: { numComponents: 2, data: centers },
        a_delta: { numComponents: 2, data: deltas },
        //a_position: { numComponents: 2, data: positions },
        indices: { numComponents: 3, data: indices, },
    };

    bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

    // const arrays = { a_position: { numComponents: 3, data: positions } };
    // bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
}

export function drawLabels(gl: WebGLRenderingContext, u_matrix: any, u_bscale:any) {
    // draw booths there
    if (!programInfo) initialize(gl);

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    const uniforms = { u_matrix, u_bscale };
    twgl.setUniforms(programInfo, uniforms);
    gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
}

