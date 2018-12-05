import * as twgl from 'twgl.js'
import svg from '@/tools/svg'

const vertexShaderSource = `attribute vec4 a_position;
uniform mat4 u_matrix;    
void main() {
    gl_Position =  u_matrix * a_position;
}`;

const fragmentSharedSource = `precision mediump float;
void main() {
    gl_FragColor = vec4(0.839, 0.839, 0.839, 1);
}`;

let programInfo: any;
let bufferInfo: any;
let prevGl: any;

function initialize(gl: WebGLRenderingContext) {
    prevGl = gl;
    programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentSharedSource]);
    const positions = [];
    
    const bgRects = (d3.select(svg).select('#BG').selectAll('rect').nodes() as SVGRectElement[])
        .map(r => Rect.fromSvgRectElement(r));

    for (const r of bgRects) {
        positions.push(r.x1, r.y1);
        positions.push(r.x2, r.y1);
        positions.push(r.x1, r.y2);

        positions.push(r.x2, r.y1);
        positions.push(r.x1, r.y2);
        positions.push(r.x2, r.y2);
    }

    const arrays = { a_position: { numComponents: 2, data: positions } };
    bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
}

export function drawBg(gl: WebGLRenderingContext, u_matrix: any) {
    // draw booths there
    if (prevGl !== gl) initialize(gl);

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, { u_matrix });    
    gl.drawArrays(gl.TRIANGLES, 0, bufferInfo.numElements);
}

