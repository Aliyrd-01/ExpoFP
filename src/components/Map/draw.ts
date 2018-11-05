import { svgWidth, svgHeight } from '@/tools/svg'
import { m4 } from 'twgl.js'
// import { getFpDestinationRectangle } from './utils';
// import c from './drawing-context'
// import { drawFpGrid, drawDebug } from './draw-debug';
import settings from '@/settings';
import { createShader, createProgram } from './utils';
// import { drawSprites } from './draw-sprites';
// export { getBoothIdFromClientXy } from './booth-by-xy';

let canvas: HTMLCanvasElement;
let gl: WebGLRenderingContext;
let matrixUniformLocation: WebGLUniformLocation;
let zoomTranform: ZoomTranform = { k: 1, x: 0, y: 0 };

type ZoomTranform = { k: number, x: number, y: number };

export function applyZoomTransform(transform: { k: number, x: number, y: number }) {
    zoomTranform = transform;
    draw();
}

const width = 500;
const height = 1000;

const positions = [
    0, 0,
    width, height,
    0, height
];

function draw() {
    let matrix = m4.ortho(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);

    // apply zoom first
    matrix = m4.translate(matrix, [zoomTranform.x * devicePixelRatio, zoomTranform.y * devicePixelRatio, 0]);
    matrix = m4.scale(matrix, [zoomTranform.k, zoomTranform.k, 1]);

    matrix = m4.translate(matrix, [gl.canvas.width / 2, gl.canvas.height / 2, 0]);
    // matrix = m4.scale(matrix, [devicePixelRatio, devicePixelRatio, 1]);
   

    const scale = Math.min(gl.canvas.width / width, gl.canvas.height / height) * 0.95;
    // const scale = 1.7;

    matrix = m4.scale(matrix, [scale, scale, 1]);
    matrix = m4.translate(matrix, [-width / 2, -height / 2, 0]);

    // apply the d3 translate and zoom
    


    // // translate the unit quad to the center 
    // matrix = m4.translate(matrix, [width / 2, height / 2, 0]);
    // // make the unit quad be half the size of the canvas
    // matrix = m4.scale(matrix, [width / 2, height / 2 , 1]);

    gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

export function initialize(canvasParam: HTMLCanvasElement) {
    // create program, set pointers


    // draw all booths for now
    canvas = canvasParam;
    sizeCanvases();
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    // define some shader programs, etc

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, `attribute vec4 a_position;
    uniform mat4 matrix;    
    void main() {
        gl_Position = matrix * a_position;
    }`);

    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, `precision mediump float;
    void main() {
        gl_FragColor = vec4(1, 0, 0.5, 1);
    }`);

    const program = createProgram(gl, vertexShader, fragmentShader);

    matrixUniformLocation = gl.getUniformLocation(program, 'matrix');
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    gl.useProgram(program);
    gl.enableVertexAttribArray(positionAttributeLocation);

    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    draw();
    // set_transform(1, 0, 0);
    // // gl.drawArrays(gl.TRIANGLES, 0, 3);

    // function set_transform(k, tx, ty) {


    //     // change the space to be pixels with 0,0 in top left
        

    // }
}


function sizeCanvases() {
    const bWidth = canvas.parentElement.clientWidth;
    const bHeight = canvas.parentElement.clientHeight;
    const cWidth = bWidth * devicePixelRatio;
    const cHeight = bHeight * devicePixelRatio;

    if (canvas.clientWidth !== bWidth || canvas.clientHeight !== bHeight) {
        console.log('Setting canvas style width/height');

        canvas.style.width = bWidth + 'px';
        canvas.style.height = bHeight + 'px';
    }

    if (cWidth !== canvas.width || cHeight !== canvas.height) {
        canvas.width = cWidth;
        canvas.height = cHeight;
    }
}