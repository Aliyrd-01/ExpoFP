import * as twgl from 'twgl.js';
import { dimColor } from './common-glsl';

export default class TriangleDrawer2 {
    readonly gl: WebGLRenderingContext;
    private buffersInitialized = true;
    private colorsDirty = true;
    private skipdimDirty = true;

    private readonly programInfo: any;
    private readonly program: WebGLProgram;
    private readonly objects: TriangleDrawerObject[] = [];
    private readonly objectsById = new Map<string, TriangleDrawerObject[]>();

    private readonly posLocation: number;
    private readonly posBuffer: WebGLBuffer;
    private readonly colorLocation: number;
    private readonly colorBuffer: WebGLBuffer;
    private readonly skipdimLocation: number;
    private readonly skipdimBuffer: WebGLBuffer;
    private readonly indexBuffer: WebGLBuffer;

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
        this.skipdimLocation = gl.getAttribLocation(this.program, "a_skipdim");
        this.posBuffer = gl.createBuffer();
        this.colorBuffer = gl.createBuffer();
        this.skipdimBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();
    }

    addObject(item: TriangleDrawerObject) {
        this.objects.push(item);
        item.skipdim = !!item.skipdim;
        if (item.id) {
            let ar = this.objectsById.get(item.id);
            if (!ar) {
                ar = [];
                this.objectsById.set(item.id, ar);
            }
            ar.push(item);
        }
    }

    updateSkipdim(id: string, skipdim: boolean) {
        const objs = this.objectsById.get(id) || [];
        for (const obj of objs) {
            if (obj.skipdim !== skipdim) {
                obj.skipdim = skipdim;
                this.skipdimDirty = true;
            }
        }
    }

    updateColor(id: string, color: Vec4) {
        const objs = this.objectsById.get(id) || [];
        for (const obj of objs) {
            if (
                !obj.color ||
                obj.color[0] !== color[0] ||
                obj.color[1] !== color[1] ||
                obj.color[2] !== color[2] ||
                obj.color[3] !== color[3]
            ) {
                obj.color = color;
                this.colorsDirty = true;
            }
        }
    }

    private ensureBuffersAndGroups() {
        if (this.buffersInitialized) {
            this.populateBuffers();
            this.buffersInitialized = false;
        }

        if (this.colorsDirty) {
            this.populateColorBuffer();
            this.colorsDirty = false;
        }

        if (this.skipdimDirty) {
            this.populateSkipdimBuffer();
            this.populateIndexBuffer();
            this.skipdimDirty = false;
        }
    }

    private populateBuffers() {

        const positions: number[] = [];
        // const colors: number[] = [];

        for (let i = 0; i < this.objects.length; i++) {
            const w = this.objects[i];

            // 3 vec2
            positions.push(...w.p0, ...w.p1, ...w.p2);
        }

        this.bufferFloat32Array(this.posBuffer, positions);


        this.populateColorBuffer();
        this.populateSkipdimBuffer();
        this.populateIndexBuffer();
    }


    private populateColorBuffer() {
        const colors: number[] = [];
        for (const w of this.objects) {
            const c = w.color || [0, 0, 0];
            colors.push(...c, ...c, ...c);
        }

        this.bufferFloat32Array(this.colorBuffer, colors);
    }

    private populateSkipdimBuffer() {
        const skipdims: number[] = [];
        for (const w of this.objects) {
            const c = w.skipdim ? 1 : 0;
            skipdims.push(c, c, c);
        }

        this.bufferFloat32Array(this.skipdimBuffer, skipdims);
    }

    private populateIndexBuffer() {
        const indices: number[] = [];
        const skipDimIndices: number[] = [];

        for (let i = 0; i < this.objects.length; i++) {
            let ar = this.objects[i].skipdim ? skipDimIndices : indices;
            ar.push(i * 3, i * 3 + 1, i * 3 + 2);
        }

        indices.push(...skipDimIndices);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
    }

    private bufferFloat32Array(buffer: WebGLBuffer, data: number[]) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
    }

    private enableBuffer(buffer: WebGLBuffer, location: number, size: 1 | 2 | 3 | 4) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.enableVertexAttribArray(location);
        this.gl.vertexAttribPointer(location, size, this.gl.FLOAT, false, 0, 0);
    }

    draw() {
        if (this.alpha < 0.05) return;
        const gl = this.gl;

        gl.useProgram(this.program);

        this.ensureBuffersAndGroups();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        this.enableBuffer(this.posBuffer, this.posLocation, 2);
        this.enableBuffer(this.colorBuffer, this.colorLocation, 4);
        this.enableBuffer(this.skipdimBuffer, this.skipdimLocation, 1);

        // if (!this.matrix) debugger;

        const uniforms = {
            u_matrix: this.matrix,
            u_dim: this.dim,
            u_alpha: this.alpha
        } as any;

        twgl.setUniforms(this.programInfo, uniforms);
        //gl.drawArrays(gl.TRIANGLES, 0, this.objects.length * 3);

        gl.drawElements(gl.TRIANGLES, this.objects.length * 3, gl.UNSIGNED_SHORT, 0);
    }
}

export interface TriangleDrawerObject {
    id?: string;
    p0: Vec2;
    p1: Vec2;
    p2: Vec2;
    color?: Vec4;
    skipdim?: boolean;
}

const vertexShaderSource = `attribute vec2 a_pos;
attribute vec4 a_color;
attribute float a_skipdim;
uniform mat4 u_matrix;   
varying vec4 v_color;
uniform float u_dim;
varying float v_dim;

void main() {
    gl_Position = u_matrix * vec4(a_pos, 0, 1);
    v_color = a_color;
    v_dim = a_skipdim > 0.0 ? 0.0 : u_dim;
}`;

// TODO: move dimColor to lib
const fragmentSharedSource = `precision mediump float;
varying vec4 v_color;
varying float v_dim; 
uniform float u_alpha;

${dimColor}

void main() {
    vec4 col = v_color;
    if (v_dim > 0.0) {
        col = dimColor(col, v_dim);
    }
    if (u_alpha != 1.0){
        col *= u_alpha;
    }
    gl_FragColor = col;
}`;

