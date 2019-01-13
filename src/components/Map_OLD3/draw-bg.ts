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
let program:WebGLProgram;
let positionLocation: number;
let positionBuffer: WebGLBuffer;
let positionsArray: Float32Array;

function initialize(gl: WebGLRenderingContext) {
    prevGl = gl;
    programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentSharedSource]);
    program = programInfo.program;
    const positions = [];
    gl.useProgram(program);

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

    positionLocation = gl.getAttribLocation(program, 'a_position');
    positionBuffer = gl.createBuffer();
    positionsArray = new Float32Array(positions);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positionsArray, gl.STATIC_DRAW);
    
    // gl.enableVertexAttribArray(positionLocation);
    // gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);


    // const arrays = { a_position: { numComponents: 2, data: positions } };
    // bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
}

export function drawBg(gl: WebGLRenderingContext, u_matrix: any) {
    // draw booths there
    if (prevGl !== gl) initialize(gl);

    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, { u_matrix });  

    gl.drawArrays(gl.TRIANGLES, 0, positionsArray.length / 2);
    // gl.drawArrays(gl.TRIANGLES, 0, bufferInfo.numElements);
}

