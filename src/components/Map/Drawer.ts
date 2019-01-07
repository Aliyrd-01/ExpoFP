import * as twgl from 'twgl.js';
import Sprite, { SpriteItem } from './Sprite';

export default class Drawer {
    readonly gl: WebGLRenderingContext;
    private dirty = true;
    private groupsDirty = true;

    private readonly programInfo: any;
    private readonly program: WebGLProgram;
    private readonly objects: DrawerObjectEx[] = [];
    private readonly objectsById = new Map<string, DrawerObjectEx>();

    private readonly centerLocation: number;
    private readonly centerBuffer: WebGLBuffer;
    private readonly deltaLocation: number;
    private readonly deltaBuffer: WebGLBuffer;
    private readonly deltaptLocation: number;
    private readonly deltaptBuffer: WebGLBuffer;
    private readonly colorLocation: number;
    private readonly colorBuffer: WebGLBuffer;
    private readonly rotateLocation: number;
    private readonly rotateBuffer: WebGLBuffer;
    private readonly texfixLocation: number;
    private readonly texfixBuffer: WebGLBuffer;
    private readonly fixdeltaLocation: number;
    private readonly fixdeltaBuffer: WebGLBuffer;
    private readonly fixdeltaptLocation: number;
    private readonly fixdeltaptBuffer: WebGLBuffer;
    private readonly fixdeltamaxptLocation: number;
    private readonly fixdeltamaxptBuffer: WebGLBuffer;

    private readonly groups: DrawerGroup[] = [];
    private readonly indexBufferPool: WebGLBuffer[] = [];
    private readonly canvasToTexture = new Map<HTMLCanvasElement, WebGLTexture>();

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentSharedSource]);
        this.program = this.programInfo.program;

        this.centerLocation = gl.getAttribLocation(this.program, "a_center");
        this.deltaLocation = gl.getAttribLocation(this.program, "a_delta");
        this.deltaptLocation = gl.getAttribLocation(this.program, "a_deltapt");
        this.colorLocation = gl.getAttribLocation(this.program, "a_color");
        this.rotateLocation = gl.getAttribLocation(this.program, "a_rotate");
        this.texfixLocation = gl.getAttribLocation(this.program, "a_texfix");
        this.fixdeltaLocation = gl.getAttribLocation(this.program, "a_fixdelta");
        this.fixdeltaptLocation = gl.getAttribLocation(this.program, "a_fixdeltapt");
        this.fixdeltamaxptLocation = gl.getAttribLocation(this.program, "a_fixdeltamaxpt");

        this.centerBuffer = gl.createBuffer();
        this.deltaBuffer = gl.createBuffer();
        this.deltaptBuffer = gl.createBuffer();
        this.colorBuffer = gl.createBuffer();
        this.rotateBuffer = gl.createBuffer();
        this.texfixBuffer = gl.createBuffer();
        this.fixdeltaBuffer = gl.createBuffer();
        this.fixdeltaptBuffer = gl.createBuffer();
        this.fixdeltamaxptBuffer = gl.createBuffer();
    }

    addObject(obj: DrawerObject) {
        const item = obj as DrawerObjectEx;
        item.visible = true;
        this.objects.push(item);
        this.objectsById.set(item.id, item);
    }

    getObject(id): DrawerObject {
        return this.objectsById.get(id);
    }

    updateVisible(id: string, visible: boolean) {
        this.objectsById.get(id).visible = visible;
        this.groupsDirty = true;
    }

    private ensureBuffersAndGroups() {
        if (!this.dirty && !this.groupsDirty) return;
        if (this.dirty) {
            this.populateBuffers();
            this.dirty = false;
        }
        if (this.groupsDirty) {
            this.populateGroups();
            this.groupsDirty = false;
        }
    }

    private populateBuffers() {
        const gl = this.gl;

        const centers: number[] = [];
        const deltas: number[] = [];
        const deltaPts: number[] = [];
        const colors: number[] = [];
        const rotates: number[] = [];
        const texcoords: number[] = [];
        const texfixes: number[] = [];
        const fixdeltas: number[] = [];
        const fixdeltapts: number[] = [];
        const fixdeltamaxpts: number[] = [];

        const sprite = new Sprite();

        // sort objects
        this.objects.sort((a, b) => a.order - b.order);
        // set index
        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].index = i;
        }

        // populate sprite
        for (let w of this.objects) {
            if (!w.canvasTmp) continue;
            w.spriteItem = sprite.addCanvas(w.canvasTmp);
            // destroy it from memory
            delete w.canvasTmp
        }

        var canvases = sprite.generateSpriteCanvases();
        // create texture per canvas
        for (const c of canvases) {
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
            this.canvasToTexture.set(c, texture);
        }

        for (let w of this.objects) {
            if (!w.spriteItem) continue;
            w.texture = this.canvasToTexture.get(w.spriteItem.containerCanvas);
        }

        // console.log('aaa', this.objects.filter(x => x.texture).length);

        for (let i = 0; i < this.objects.length; i++) {
            const w = this.objects[i];
            // 4 vec2
            centers.push(...w.center, ...w.center, ...w.center, ...w.center);
            // preare points x1, y1, ... xp1, yp1
            const d = w.deltas || [0, 0, 0, 0];
            const x1 = d[0], y1 = d[1], x2 = d[2], y2 = d[3];
            const dp = w.deltaPts || [0, 0, 0, 0];
            const scale = w.scalePts || 1;
            const xp1 = dp[0] * scale, yp1 = dp[1] * scale, xp2 = dp[2] * scale, yp2 = dp[3] * scale;
            // 4 vec2
            {
                deltas.push(x1, y1, x2, y1, x1, y2, x2, y2);
            }
            // 4 vec2
            {

                deltaPts.push(xp1, yp1, xp2, yp1, xp1, yp2, xp2, yp2);
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
                if (!w.spriteItem) {
                    texcoords.push(0, 0, 0, 0, 0, 0, 0, 0);
                } else {
                    const r = w.spriteItem.rect;
                    texcoords.push(r.x1, r.y1, r.x2, r.y1, r.x1, r.y2, r.x2, r.y2);
                }
            }
            // texfix 4 vec2
            {
                let val: Vec2;
                if (!w.spriteItem) {
                    val = [0, 0];
                } else if (w.texPosition === 'center') {
                    val = [w.spriteItem.rect.cx, w.spriteItem.rect.cy];
                } else {
                    val = [w.spriteItem.rect.x1, w.spriteItem.rect.y1];
                }

                texfixes.push(...val, ...val, ...val, ...val);
            }
            // fixdelta 4 vec2
            {
                let val: Vec2;
                if (!w.spriteItem || w.texPosition === 'center') {
                    val = [0, 0];
                } else {
                    val = [x1, y1];
                }
                fixdeltas.push(...val, ...val, ...val, ...val);
            }
            // fixdeltapt 4 vec2
            {
                let val: Vec2;
                if (!w.spriteItem || w.texPosition === 'center') {
                    val = [0, 0];
                } else {
                    val = [xp1, yp1];
                }
                fixdeltapts.push(...val, ...val, ...val, ...val);
            }

            // fixdeltamaxpt 4 vec2
            {
                let val: Vec2;
                if (!w.spriteItem || w.texPosition === 'center') {
                    val = [0, 0];
                } else {
                    val = [w.spriteItem.rect.w, w.spriteItem.rect.h];
                    //val = [0, 0];
                }
                fixdeltamaxpts.push(...val, ...val, ...val, ...val);
            }
        }

        this.bufferFloat32Array(this.centerBuffer, centers);
        this.bufferFloat32Array(this.deltaBuffer, deltas);
        this.bufferFloat32Array(this.deltaptBuffer, deltaPts);
        this.bufferFloat32Array(this.colorBuffer, colors);
        this.bufferFloat32Array(this.rotateBuffer, rotates);
        this.bufferFloat32Array(this.texfixBuffer, texfixes);
        this.bufferFloat32Array(this.fixdeltaBuffer, fixdeltas);
        this.bufferFloat32Array(this.fixdeltaptBuffer, fixdeltapts);
        this.bufferFloat32Array(this.fixdeltamaxptBuffer, fixdeltamaxpts);
    }

    private populateGroups() {
        // console.log('this.populateGroups', this.indexBufferPool.length);
        const groups: { indices: number[], texture: WebGLTexture, texsize: Vec2 }[] = [];
        let currentGroup: { indices: number[], texture: WebGLTexture, texsize: Vec2 };

        for (let obj of this.objects) {
            if (!obj.visible) continue;
            if (!currentGroup ||
                (currentGroup.texture && obj.texture && currentGroup.texture !== obj.texture)) {
                currentGroup = { indices: [], texture: undefined, texsize: undefined };
                groups.push(currentGroup);
            }

            if (obj.texture && !currentGroup.texture) {
                currentGroup.texture = obj.texture;
                currentGroup.texsize = [obj.spriteItem.containerCanvas.width, obj.spriteItem.containerCanvas.height];
            }

            currentGroup.indices.push(obj.index);
        }

        const indexBuffers: WebGLBuffer[] = [];
        this.groups.length = 0;

        for (let group of groups) {
            const buffer = this.indexBufferPool.shift() || this.gl.createBuffer();//
            indexBuffers.push(buffer);

            const realIndices = [];
            for (let i of group.indices) {
                const n = i * 4;
                realIndices.push(n, n + 1, n + 2, n + 1, n + 2, n + 3)
            }

            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(realIndices), this.gl.STATIC_DRAW);

            this.groups.push({
                texture: group.texture,
                indexBuffer: buffer,
                numElements: realIndices.length,
                texsize: group.texsize
            });
        }

        this.indexBufferPool.unshift(...indexBuffers);
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

    draw(u_matrix: any, ptscale: number) {
        const gl = this.gl;

        gl.useProgram(this.program);

        this.ensureBuffersAndGroups();

        this.enableBuffer(this.centerBuffer, this.centerLocation, 2);
        this.enableBuffer(this.deltaBuffer, this.deltaLocation, 2);
        this.enableBuffer(this.deltaptBuffer, this.deltaptLocation, 2);
        this.enableBuffer(this.colorBuffer, this.colorLocation, 4);
        this.enableBuffer(this.rotateBuffer, this.rotateLocation, 2);
        this.enableBuffer(this.texfixBuffer, this.texfixLocation, 2);
        this.enableBuffer(this.fixdeltaBuffer, this.fixdeltaLocation, 2);
        this.enableBuffer(this.fixdeltaptBuffer, this.fixdeltaptLocation, 2);
        this.enableBuffer(this.fixdeltamaxptBuffer, this.fixdeltamaxptLocation, 2);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        for (let group of this.groups) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, group.indexBuffer);
            twgl.setUniforms(this.programInfo, {
                u_matrix,
                u_ptscale: [ptscale, ptscale],
                u_texture: group.texture,
                u_texsize: group.texsize
            });
            gl.drawElements(gl.TRIANGLES, group.numElements, gl.UNSIGNED_SHORT, 0);
        }

        gl.disable(gl.BLEND);
    }
}

export interface DrawerObject {
    id: string,
    center: Vec2;
    deltas?: Vec4; // x1, y1, x2, y2
    deltaPts?: Vec4;
    scalePts?: number,
    texPosition?: 'center' | 'lefttop'
    color?: Vec4;
    rotateRadians?: number;
    spriteItem?: SpriteItem;
    canvasTmp?: HTMLCanvasElement;
    order: number;

    //always: boolean;
}

interface DrawerObjectEx extends DrawerObject {
    visible: boolean;
    texture?: WebGLTexture;
    texcoords: Vec4; // x1, y1, x2, y2
    index: number;
}

interface DrawerGroup {
    texsize: Vec2,
    texture: WebGLTexture;
    indexBuffer: WebGLBuffer;
    numElements: number;
}


const vertexShaderSource = `attribute vec2 a_center;
attribute vec2 a_rotate;
attribute vec2 a_delta;
attribute vec2 a_deltapt;
attribute vec4 a_color;
attribute vec2 a_texcoord; 
attribute vec2 a_fixdelta;
attribute vec2 a_fixdeltapt; 
attribute vec2 a_fixdeltamaxpt; 
attribute vec2 a_texfix;

uniform mat4 u_matrix;   
uniform vec2 u_ptscale; 
uniform vec2 u_texsize;

varying vec2 v_texcoord;
varying vec4 v_color;

void main() {
    vec2 delta = a_delta + a_deltapt * u_ptscale;

    vec2 fixdelta = a_fixdelta + a_fixdeltapt * u_ptscale;

    // calc maxdelta from a_fixdeltamaxpt
    // this is relative to fix point (on svg)
    vec2 fixdeltamax = a_fixdeltamaxpt * u_ptscale;
    vec2 deltamax = fixdeltamax + fixdelta;
    if (a_fixdeltamaxpt.x > 0.0){
        delta = vec2(min(delta.x, deltamax.x), min(delta.y, deltamax.y));
    }

    vec2 diff = delta - fixdelta;
    vec2 texdeltapt = diff / u_ptscale;
    vec2 texcoord = a_texfix + texdeltapt;

    vec2 rotatedDelta =  vec2(
        delta.x * a_rotate.y + delta.y * a_rotate.x,
        delta.y * a_rotate.y - delta.x * a_rotate.x);
    gl_Position = u_matrix * vec4(a_center + rotatedDelta, 0, 1);

    v_texcoord = texcoord / u_texsize;
    v_color = a_color;
}`;

const fragmentSharedSource = `precision mediump float;
varying vec2 v_texcoord;
varying vec4 v_color;
uniform sampler2D u_texture;

void main() {
    if (v_color.w != 0.0){
        gl_FragColor = v_color; 
    } else {
        gl_FragColor = texture2D(u_texture, v_texcoord);
    }
}`;

