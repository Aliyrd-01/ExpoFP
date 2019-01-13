import * as twgl from 'twgl.js'
import svg from '@/tools/svg'

const vertexShaderSource = `attribute vec4 a_position;
uniform mat4 u_matrix;    
void main() {
    gl_Position =  u_matrix * a_position;
}`;

const fragmentSharedSource = `precision mediump float;
void main() {
    gl_FragColor = vec4(1, 1, 1, 1);
}`;

let programInfo: any;
let bufferInfo: any;
let prevGl: any;

function initialize(gl: WebGLRenderingContext) {
    prevGl = gl;
    programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentSharedSource]);
    const positions = [];
    const wallLines = (d3.select(svg).select('#Walls').selectAll('line')
        .nodes() as SVGLineElement[]).map(r => Line.fromSvgLineElement(r));

    for (const line of wallLines) {
        positions.push(line.x1, line.y1);
        positions.push(line.x2, line.y2);
    }

    const arrays = { a_position: { numComponents: 2, data: positions } };
    bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
}

export function drawWalls(gl: WebGLRenderingContext, u_matrix: any) {
    // draw booths there 
    if (prevGl !== gl) initialize(gl);

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, { u_matrix });    
    gl.drawArrays(gl.LINES, 0, bufferInfo.numElements);
}

