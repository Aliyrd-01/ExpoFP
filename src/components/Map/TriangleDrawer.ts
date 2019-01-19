import * as twgl from 'twgl.js';
import { dimColor } from './common-glsl';

export default class TriangleDrawer {
    readonly gl: WebGLRenderingContext;
    private buffersInitialized = true;

    private readonly programInfo: any;
    private readonly program: WebGLProgram;
    private readonly objects: TriangleDrawerObject[] = [];

    private readonly posLocation: number;
    private readonly posBuffer: WebGLBuffer;
    private readonly colorLocation: number;
    private readonly colorBuffer: WebGLBuffer;

    // to be set externally
    public matrix: any;
    public ptscale: number;
    public alpha = 1;
    public dim = 0;

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentSharedSource]);
        this.program = this.programInfo.program;
        this.posLocation = gl.getAttribLocation(this.program, "a_pos");
        this.colorLocation = gl.getAttribLocation(this.program, "a_color");
        this.posBuffer = gl.createBuffer();
        this.colorBuffer = gl.createBuffer();
    }

    addObject(obj: TriangleDrawerObject) {
        const item = obj as TriangleDrawerObject;
        this.objects.push(item);
    }

    private ensureBuffersAndGroups() {
        if (this.buffersInitialized) {
            this.populateBuffers();
            this.buffersInitialized = false;
        }
    }

    private populateBuffers() {

        const positions: number[] = [];
        const colors: number[] = [];

        for (let i = 0; i < this.objects.length; i++) {
            const w = this.objects[i];

            // 3 vec2
            positions.push(...w.p0, ...w.p1, ...w.p2);

            // 3 vec4
            {
                const c = w.color || [0, 0, 0];
                colors.push(...c, ...c, ...c);
            }
        }


        this.bufferFloat32Array(this.posBuffer, positions);
        this.bufferFloat32Array(this.colorBuffer, colors);
    }

    private bufferFloat32Array(buffer: WebGLBuffer, data: number[]) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
    }

    private enableBuffer(buffer: WebGLBuffer, location: number, size: 2 | 4) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.enableVertexAttribArray(location);
        this.gl.vertexAttribPointer(location, size, this.gl.FLOAT, false, 0, 0);
    }

    draw() {
        if (this.alpha < 0.05) return;
        const gl = this.gl;

        gl.useProgram(this.program);

        this.ensureBuffersAndGroups();

        this.enableBuffer(this.posBuffer, this.posLocation, 2);
        this.enableBuffer(this.colorBuffer, this.colorLocation, 4);



        const uniforms = {
            u_matrix: this.matrix,
            u_dim: this.dim,
            u_alpha: this.alpha
        } as any;

        twgl.setUniforms(this.programInfo, uniforms);
        gl.drawArrays(gl.TRIANGLES, 0, this.objects.length * 3);


    }
}

export interface TriangleDrawerObject {
    p0: Vec2;
    p1: Vec2;
    p2: Vec2;
    color?: Vec4;
}

const vertexShaderSource = `attribute vec2 a_pos;
attribute vec4 a_color;
uniform mat4 u_matrix;   
varying vec4 v_color;

void main() {
    gl_Position = u_matrix * vec4(a_pos, 0, 1);
    v_color = a_color;
}`;

// TODO: move dimColor to lib
const fragmentSharedSource = `precision mediump float;
varying vec4 v_color;
uniform float u_dim; 
uniform float u_alpha;

${dimColor}

void main() {
    vec4 col = v_color;
    if (u_dim > 0.0) {
        col = dimColor(col, u_dim);
    }
    if (u_alpha != 1.0){
        col *= u_alpha;
    }
    gl_FragColor = col;
}`;

