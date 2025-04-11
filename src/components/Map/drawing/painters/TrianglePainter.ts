import * as twgl from "twgl.js";
import { dimColor } from "./common-glsl";
import Painter from "./Painter";

export default class TrianglePainter implements Painter {
    private readonly gl: WebGLRenderingContext;
    private buffersInitialized = false;
    // private colorsDirty = true;
    private skipdimDirty = true;
    private readonly colorsObjectsPending: TrianglePainterObject[] = [];

    private readonly programInfo: any;
    private readonly program: WebGLProgram;
    private readonly objects: TrianglePainterObject[] = [];
    private readonly objectsById = new Map<string, TrianglePainterObject[]>();
    private readonly objectsIndices = new Map<TrianglePainterObject, number>();

    private readonly posLocation: number;
    private readonly posBuffer: WebGLBuffer;
    private readonly colorLocation: number;
    private readonly colorBuffer: WebGLBuffer;
    private readonly skipdimLocation: number;
    private readonly skipdimBuffer: WebGLBuffer;
    private readonly indexBuffer: WebGLBuffer;
    private indexBufferIsUint32: boolean;

    // to be set externally
    public id: string;
    public visible: boolean = true;
    public orderPriority: number;
    public matrix: any;
    public ptscale: number;
    public alpha = 1;
    public dim = 0;
    private readonly maxObjects = Math.floor(65535 / 3);
    // private readonly maxObjects = Math.floor(65545 / 3);

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentSharedSource]);
        // https://expofp.atlassian.net/browse/EFP-4685
        // https://twgljs.org/docs/module-twgl.html#.createProgramInfo
        if (!this.programInfo) throw new Error("Failed to link or compile WebGL program (TrianglePainter)");
        this.program = this.programInfo.program;
        this.posLocation = gl.getAttribLocation(this.program, "a_pos");
        this.colorLocation = gl.getAttribLocation(this.program, "a_color");
        this.skipdimLocation = gl.getAttribLocation(this.program, "a_skipdim");
        this.posBuffer = gl.createBuffer();
        this.colorBuffer = gl.createBuffer();
        this.skipdimBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();

        // this.maxObjects =
        //     typeof WebGL2RenderingContext === "undefined" && gl.getSupportedExtensions().indexOf("OES_element_index_uint") === -1
        //         ? Math.floor(65535 / 3)
        //         : Math.floor(Math.pow(2, 256) / 3);
    }

    tryAddObject(item: TrianglePainterObject) {
        if (this.objects.length >= this.maxObjects) return false;
        // if (item.id)console.log("Added", item.id)
        this.objectsIndices.set(item, this.objects.length);
        this.objects.push(item);
        item.skipdim = !!item.skipdim;
        this.addToId(item, item.id);
        this.addToId(item, item.groupId);
        return true;
    }

    // addObject(item: TrianglePainterObject) {
    //     this.objectsIndices.set(item, this.objects.length);
    //     this.objects.push(item);
    //     item.skipdim = !!item.skipdim;
    //     this.addToId(item, item.id);
    //     this.addToId(item, item.groupId);
    // }

    private addToId(item: TrianglePainterObject, id: string) {
        if (id) {
            let ar = this.objectsById.get(id);
            if (!ar) {
                ar = [];
                this.objectsById.set(id, ar);
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
                if (this.buffersInitialized) this.colorsObjectsPending.push(obj);
            }
        }
    }

    private ensureBuffersInternal() {
        if (!this.buffersInitialized) {
            this.populateBuffers();
            this.buffersInitialized = true;
        }

        // if (this.colorsDirty) {
        //     this.populateColorBuffer();
        //     this.colorsDirty = false;
        // }

        this.updateColorBuffer();

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
            colors.push(...getObjColorArray(w));
        }
        this.bufferFloat32Array(this.colorBuffer, colors);
    }

    private updateColorBuffer() {
        if (this.colorsObjectsPending.length === 0) return;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);

        for (const obj of this.colorsObjectsPending) {
            const index = this.objectsIndices.get(obj);
            const ar = getObjColorArray(obj);
            const offset = ar.length * index * 4; // 4 comes from float32 bytes
            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, offset, new Float32Array(ar));
        }
        this.colorsObjectsPending.length = 0;
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

        this.indexBufferIsUint32 = indices.length > 65535;
        const ar = this.indexBufferIsUint32 ? new Uint32Array(indices) : new Uint16Array(indices);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, ar, this.gl.STATIC_DRAW);
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

    preparePaint() {
        this.gl.useProgram(this.program);
        this.ensureBuffersInternal();
    }

    paint() {
        if (this.alpha < 0.05 || !this.visible) return;
        const gl = this.gl;

        this.preparePaint();

        this.enableBuffer(this.posBuffer, this.posLocation, 2);
        this.enableBuffer(this.colorBuffer, this.colorLocation, 4);
        this.enableBuffer(this.skipdimBuffer, this.skipdimLocation, 1);

        const uniforms = {
            u_matrix: this.matrix,
            u_dim: this.dim,
            u_alpha: this.alpha,
        } as any;

        twgl.setUniforms(this.programInfo, uniforms);

        const elementsToDraw = this.objects.length * 3;

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, elementsToDraw, this.indexBufferIsUint32 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, 0);
    }
}

// utility functions
function getObjColorArray(obj: TrianglePainterObject) {
    const c = obj.color || [0, 0, 0, 1];
    return [...c, ...c, ...c];
}

export interface TrianglePainterObject {
    id?: string;
    groupId?: string;
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
