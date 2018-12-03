import * as twgl from 'twgl.js'

const vertexShaderSource = `attribute vec4 a_position;
uniform mat4 u_matrix;    
void main() {
    gl_Position = u_matrix * a_position;
}`;

const fragmentSharedSource = `precision mediump float;
void main() {
    gl_FragColor = vec4(1, 1, 0.5, 1);
}`;


let programInfo: any;
let bufferInfo: any;

function initialize(gl: WebGLRenderingContext) {
    programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentSharedSource]);

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

    for (const b of booths) {
        addRect(b.rect.x1, b.rect.x2, b.rect.y1, b.rect.y2);
    }

    const arrays = { a_position: { numComponents: 2, data: positions } };
    bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
}

export function drawLabels(gl: WebGLRenderingContext, u_matrix: any) {
    // draw booths there
    if (!programInfo) initialize(gl);

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    const uniforms = { u_matrix };
    twgl.setUniforms(programInfo, uniforms);    
    gl.drawArrays(gl.TRIANGLES, 0, bufferInfo.numElements);
}

