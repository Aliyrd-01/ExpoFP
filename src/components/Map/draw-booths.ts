import * as twgl from 'twgl.js'

const vertexShaderSource = `attribute vec2 a_position1;
attribute vec2 a_center;
attribute vec2 rotate;
attribute vec2 a_delta;
attribute vec2 a_deltapx;
uniform mat4 u_matrix;    
void main() {
    gl_Position = u_matrix * vec4(a_position1.xy, 0, 1);
}`;

const fragmentSharedSource = `precision mediump float;
void main() {
    //41B6E7
    gl_FragColor = vec4(65.0/ 255.0, 182.0/ 255.0, 231.0/ 255.0, 1);
}`;


let programInfo: any;
let bufferInfo: any;
let program:WebGLProgram;
let prevGl: any;
let positionLocation: number;
let positionBuffer: WebGLBuffer;
let positionsArray: Float32Array;
let centerLocation: number;
let centerBuffer: WebGLBuffer;
let centerArray: Float32Array;


function initialize(gl: WebGLRenderingContext) {
    prevGl = gl;
    programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentSharedSource]);
    program = programInfo.program;
    
    gl.useProgram(program);

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

    positionLocation = gl.getAttribLocation(program, 'a_position1');
    positionBuffer = gl.createBuffer();
    positionsArray = new Float32Array(positions);

     
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positionsArray, gl.STATIC_DRAW);
    

    // gl.enableVertexAttribArray(positionLocation);
    // gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // centerLocation = gl.getAttribLocation(program, 'a_center');
    // centerBuffer = gl.createBuffer();
    // centerArray = new Float32Array(positions);

     
    // gl.bindBuffer(gl.ARRAY_BUFFER, centerBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, centerArray, gl.STATIC_DRAW);
    
    


    // gl.enableVertexAttribArray(positionLocation);
    // gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, positionsArray, gl.DYNAMIC_DRAW);
   
    // const arrays = { a_position: { numComponents: 2, data: positions } };
    // bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
}

export function drawBooths(gl: WebGLRenderingContext, u_matrix: any) {
    // draw booths there 
    if (prevGl !== gl) initialize(gl);

    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    // gl.enableVertexAttribArray(centerLocation);
    // gl.vertexAttribPointer(centerLocation, 2, gl.FLOAT, false, 0, 0);
   

    twgl.setUniforms(programInfo, { u_matrix });    
    gl.drawArrays(gl.TRIANGLES, 0, positionsArray.length / 2);
}

