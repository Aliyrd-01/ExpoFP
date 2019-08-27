import Color from "color";
import * as twgl from "twgl.js";
import { dimColor } from "./common-glsl";
import settings from "../../../../tools/settings";
import Painter from "./Painter";
import "../../../../tools/Color";

// console.log('coo', Color, settings, settings.colors)
const bgColor = Color(settings.colors.base).vec4();

export default class BgPainter implements Painter {
    public orderPriority: number;
    private readonly gl: WebGLRenderingContext;
    private readonly programInfo: any;
    private readonly program: WebGLProgram;
    private readonly positionLocation: number;
    private readonly positionBuffer: WebGLBuffer;
    private readonly colorLocation: number;
    private readonly colorBuffer: WebGLBuffer;

    dim = 0;

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentSharedSource]);
        this.program = this.programInfo.program;

        this.positionLocation = gl.getAttribLocation(this.program, "a_position");
        this.colorLocation = gl.getAttribLocation(this.program, "a_color");
        this.positionBuffer = gl.createBuffer();
        this.colorBuffer = gl.createBuffer();

        this.bufferFloat32Array(this.positionBuffer, [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
        this.bufferFloat32Array(this.colorBuffer, [...bgColor, ...bgColor, ...bgColor, ...bgColor, ...bgColor, ...bgColor]);
    }

    preparePaint() {}

    paint() {
        const gl = this.gl;
        gl.useProgram(this.program);

        this.enableBuffer(this.colorBuffer, this.colorLocation, 4);
        this.enableBuffer(this.positionBuffer, this.positionLocation, 2);

        const uniforms = {
            u_dim: this.dim
        } as any;

        twgl.setUniforms(this.programInfo, uniforms);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
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
varying vec4 v_color;
varying float v_dim;

void main() {
    gl_Position = vec4(a_position, 0, 1);
    v_color = a_color;
}`;

const fragmentSharedSource = `precision mediump float;
varying vec4 v_color;
uniform float u_dim; 

${dimColor}

void main() {
    vec4 col = v_color; 
    if (u_dim > 0.0) {
        col = dimColor(col, u_dim);
    }
    gl_FragColor = col;
}`;
