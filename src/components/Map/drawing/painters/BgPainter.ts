import * as twgl from "twgl.js";
import "../../../../tools/Color";
import { dimColor } from "./common-glsl";
import Painter from "./Painter";

// console.log('coo', Color, settings, settings.colors)
// const bgColor = Color(settings.colors.base).vec4();

export default class BgPainter implements Painter {
    public id: string;
    public orderPriority: number;
    public visible: boolean = true;
    private readonly gl: WebGLRenderingContext;
    private readonly programInfo: any;
    private readonly program: WebGLProgram;
    private readonly positionLocation: number;
    private readonly positionBuffer: WebGLBuffer;
    private readonly colorLocation: number;
    private readonly colorBuffer: WebGLBuffer;
    private readonly nodimLocation: number;
    private readonly nodimBuffer: WebGLBuffer;
    private positions: number[];
    private colors: number[];
    private nodims: number[];
    private dirty = true;

    dim = 0;

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentSharedSource]);
        // https://expofp.atlassian.net/browse/EFP-4685
        // https://twgljs.org/docs/module-twgl.html#.createProgramInfo
        if (!this.programInfo) throw new Error("Failed to link or compile WebGL program (BgPainter)");
        this.program = this.programInfo.program;

        this.positionLocation = gl.getAttribLocation(this.program, "a_position");
        this.colorLocation = gl.getAttribLocation(this.program, "a_color");
        this.nodimLocation = gl.getAttribLocation(this.program, "a_nodim");
        this.positionBuffer = gl.createBuffer();
        this.colorBuffer = gl.createBuffer();
        this.nodimBuffer = gl.createBuffer();

        // this.bufferFloat32Array(this.positionBuffer, [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
        // this.bufferFloat32Array(this.colorBuffer, [...bgColor, ...bgColor, ...bgColor, ...bgColor, ...bgColor, ...bgColor]);
    }

    setObjects(positions: number[], colors: number[], nodims: number[]) {
        this.dirty = true;
        this.positions = positions;
        this.colors = colors;
        this.nodims = nodims;
    }

    preparePaint() {
        this.gl.useProgram(this.program);
        if (!this.dirty || !this.colors || !this.positions) return;
        // console.log("bgRect3")
        this.bufferFloat32Array(this.positionBuffer, this.positions);
        this.bufferFloat32Array(this.colorBuffer, this.colors);
        this.bufferFloat32Array(this.nodimBuffer, this.nodims);
        this.dirty = false;
    }

    paint() {
        if (!this.visible) return;

        const gl = this.gl;
        this.preparePaint();
        if (!this.colors) return;

        this.enableBuffer(this.colorBuffer, this.colorLocation, 4);
        this.enableBuffer(this.positionBuffer, this.positionLocation, 2);
        this.enableBuffer(this.nodimBuffer, this.nodimLocation, 1);

        const uniforms = {
            u_dim: this.dim,
        } as any;

        twgl.setUniforms(this.programInfo, uniforms);
        gl.drawArrays(gl.TRIANGLES, 0, this.positions.length / 2);
    }

    private bufferFloat32Array(buffer: WebGLBuffer, data: number[]) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
    }

    private enableBuffer(buffer: WebGLBuffer, location: number, size: 1 | 2 | 4) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.enableVertexAttribArray(location);
        this.gl.vertexAttribPointer(location, size, this.gl.FLOAT, false, 0, 0);
    }
}

const vertexShaderSource = `attribute vec2 a_position;
attribute vec4 a_color;
attribute float a_nodim;
varying vec4 v_color;
varying float v_nodim;
// varying float v_dim;

void main() {
    gl_Position = vec4(a_position, 0, 1);
    v_color = a_color;
    v_nodim = a_nodim;
}`;

const fragmentSharedSource = `precision mediump float;
varying vec4 v_color;
varying float v_nodim;
uniform float u_dim; 

${dimColor}

void main() {
    vec4 col = v_color; 
    if (u_dim > 0.0 && v_nodim < 1.0) {
        col = dimColor(col, u_dim);
    }
    gl_FragColor = col;
}`;
