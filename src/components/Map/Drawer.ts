
import * as twgl from 'twgl.js';


export default class Drawer {
    readonly gl: WebGLRenderingContext;
    private dirty = true;
    private visibleDirty = true;
    private numElements: number;

    private readonly programInfo: any;
    private readonly program: WebGLProgram;
    private readonly objects: DrawerObjectEx[] = [];
    private readonly objectsById = new Map<string, DrawerObjectEx>();

    private readonly centerLocation: number;
    private readonly centerBuffer: WebGLBuffer;
    private readonly deltaLocation: number;
    private readonly deltaBuffer: WebGLBuffer;
    private readonly deltapxLocation: number;
    private readonly deltapxBuffer: WebGLBuffer;
    private readonly colorLocation: number;
    private readonly colorBuffer: WebGLBuffer;
    private readonly rotateLocation: number;
    private readonly rotateBuffer: WebGLBuffer;
    private readonly texcoordLocation: number;
    private readonly texcoordBuffer: WebGLBuffer;
    private readonly indexBuffer: WebGLBuffer;


    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentSharedSource]);
        this.program = this.programInfo.program;

        this.centerLocation = gl.getAttribLocation(this.program, "a_center");
        this.deltaLocation = gl.getAttribLocation(this.program, "a_delta");
        this.deltapxLocation = gl.getAttribLocation(this.program, "a_deltapx");
        this.colorLocation = gl.getAttribLocation(this.program, "a_color");
        this.rotateLocation = gl.getAttribLocation(this.program, "a_rotate");
        this.texcoordLocation = gl.getAttribLocation(this.program, "a_texcoord");

        this.centerBuffer = gl.createBuffer();
        this.deltaBuffer = gl.createBuffer();
        this.deltapxBuffer = gl.createBuffer();
        this.colorBuffer = gl.createBuffer();
        this.rotateBuffer = gl.createBuffer();
        this.texcoordBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();
    }

    addObject(obj: DrawerObject) {
        const item = obj as DrawerObjectEx;
        item.visible = true;
        this.objects.push(item);
        this.objectsById.set(item.id, item);
    }

    updateVisible(id: string, visible: boolean) {
        this.objectsById.get(id).visible = visible;
        this.visibleDirty = true;
    }

    draw(u_matrix: any, u_pxscale: any) {
        const gl = this.gl;

        gl.useProgram(this.program);

        this.ensureBuffers();

        this.enableBuffer(this.centerBuffer, this.centerLocation, 2);
        this.enableBuffer(this.deltaBuffer, this.deltaLocation, 2);
        this.enableBuffer(this.deltapxBuffer, this.deltapxLocation, 2);
        this.enableBuffer(this.colorBuffer, this.colorLocation, 4);
        this.enableBuffer(this.rotateBuffer, this.rotateLocation, 2);
        this.enableBuffer(this.texcoordBuffer, this.texcoordLocation, 2);

       

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        //, u_texture: texture
        twgl.setUniforms(this.programInfo, { u_matrix, u_pxscale });

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.drawElements(gl.TRIANGLES, this.numElements, gl.UNSIGNED_SHORT, 0);
        gl.disable(gl.BLEND);
    }

    private ensureBuffers() {
        if (!this.dirty && !this.visibleDirty) return;
        if (this.dirty) {
            this.populateBuffers();
            this.dirty = false;
        }
        if (this.visibleDirty) {
            this.populateIndexBuffer();
            this.visibleDirty = false;
        }
    }

    private populateBuffers() {
        const centers: number[] = [];
        const deltas: number[] = [];
        const deltasPx: number[] = [];
        const colors: number[] = [];
        const rotates: number[] = [];
        const texcoords: number[] = [];

        for (let i = 0; i < this.objects.length; i++) {
            const w = this.objects[i];
            // 4 vec2
            centers.push(...w.center, ...w.center, ...w.center, ...w.center);
            // 4 vec2
            {
                const d = w.deltas || [0, 0, 0, 0];
                const x1 = d[0], y1 = d[1], x2 = d[2], y2 = d[3];
                deltas.push(x1, y1, x2, y1, x1, y2, x2, y2);
            }
            // 4 vec2
            {
                const d = w.deltasPx || [0, 0, 0, 0];
                const x1 = d[0], y1 = d[1], x2 = d[2], y2 = d[3];
                deltasPx.push(x1, y1, x2, y1, x1, y2, x2, y2);
            }
            // 4 vec4
            {
                const c = w.color || [0, 0, 0, 0];
                colors.push(...c, ...c, ...c, ...c);
            }
            // 4 vec2
            {
                const angleInRadians = w.rotateRadians || 0;
                const r = [Math.sin(angleInRadians), Math.cos(angleInRadians)];
                rotates.push(...r, ...r, ...r, ...r);
            }
            // 4 vec2
            {
                const r = [0, 0];
                texcoords.push(...r, ...r, ...r, ...r);
            }
        }

        this.bufferFloat32Array(this.centerBuffer, centers);
        this.bufferFloat32Array(this.deltaBuffer, deltas);
        this.bufferFloat32Array(this.deltapxBuffer, deltasPx);
        this.bufferFloat32Array(this.colorBuffer, colors);
        this.bufferFloat32Array(this.rotateBuffer, rotates);
        this.bufferFloat32Array(this.texcoordBuffer, texcoords);
    }

    private populateIndexBuffer() {
        const indices: number[] = [];
        for (let i = 0; i < this.objects.length; i++) {
            const w = this.objects[i];
            if (w.visible) {
                const n = i * 4;
                indices.push(n, n + 1, n + 2, n + 1, n + 2, n + 3)
            }
        }
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);

        this.numElements = indices.length;
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
}

export interface DrawerObject {
    id: string,
    center: Vec2;
    deltas?: Vec4; // x1, y1, x2, y2
    deltasPx?: Vec4;
    color?: Vec4;
    rotateRadians?: number;
    canvas?: HTMLCanvasElement;
}

interface DrawerObjectEx extends DrawerObject {
    visible: boolean
}



const vertexShaderSource = `
attribute vec2 a_center;
attribute vec2 a_rotate;
attribute vec2 a_delta;
attribute vec2 a_deltapx;
attribute vec4 a_color;
attribute vec2 a_texcoord;

uniform mat4 u_matrix;   
uniform vec2 u_pxscale; 
varying vec2 v_texcoord;
varying vec4 v_color;

void main() {
    vec2 delta = a_delta + a_deltapx * u_pxscale;
    vec2 rotatedDelta =  vec2(
        delta.x * a_rotate.y + delta.y * a_rotate.x,
        delta.y * a_rotate.y - delta.x * a_rotate.x);
    gl_Position = u_matrix * vec4(a_center + rotatedDelta, 0, 1);
    v_texcoord = a_texcoord;//vec2(0,0);
    v_color = a_color;
}`;

const fragmentSharedSource = `precision mediump float;
varying vec2 v_texcoord;
varying vec4 v_color;
//uniform sampler2D u_texture;

void main() {
    gl_FragColor = v_color; 
    // if (v_color.w != 0.0){
    //     gl_FragColor = v_color; 
    // } else {
    //     //gl_FragColor = texture2D(u_texture, v_texcoord);
    // }
}`;

