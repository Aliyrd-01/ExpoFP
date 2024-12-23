import * as twgl from "twgl.js";
import Rect from "../../../../core/Rect";
import isDebug from "../../../../utils/is-debug";
import { dimColor } from "./common-glsl";
import Painter from "./Painter";
import { DrawerObject } from "./RectPainter";
import Sprite from "./Sprite";
import { logBuffer } from "../../../../tools/webgl-logger";
import data from "../../../../data";
import isMobile from "../../../../utils/is-mobile";
import isWebview from "../../../../utils/is-webview";

const mobileCanvasSize = data.viewOptimizationLevel >= 4 ? 64 : 256;
const offscreenCanvas = document.createElement("canvas");
offscreenCanvas.width = mobileCanvasSize;
offscreenCanvas.height = mobileCanvasSize;
const offscreenCanvasCtx = offscreenCanvas.getContext("2d");

const reduceImageQuality = (isMobile || isWebview) && data.viewOptimizationLevel >= 4;

export default class ImagePainter implements Painter {
    readonly gl: WebGLRenderingContext;
    private buffersInitialized = true;
    private groupsDirty = true;
    private colorsDirty = true;
    private centersDirty = true;
    private rotateDirty = true;
    private skipdimDirty = true;
    private stretchDirty = true;

    private readonly programInfo: any;
    private readonly program: WebGLProgram;
    private readonly objects: DrawerObjectEx[] = [];
    private readonly sortedObjects: DrawerObjectEx[] = [];
    private readonly objectsById = new Map<string, DrawerObjectEx>();

    private readonly centerLocation: number;
    private readonly centerBuffer: WebGLBuffer;
    private readonly deltaLocation: number;
    private readonly deltaBuffer: WebGLBuffer;
    private readonly deltaptLocation: number;
    private readonly deltaptBuffer: WebGLBuffer;
    private readonly colorLocation: number;
    private readonly colorBuffer: WebGLBuffer;
    private readonly skipdimLocation: number;
    private readonly skipdimBuffer: WebGLBuffer;
    private readonly stretchLocation: number;
    private readonly stretchBuffer: WebGLBuffer;
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
    private readonly fallBackTexture: WebGLTexture;
    private indexBuffersAreUint: boolean;

    // to be set externally
    public id: string;
    public visible: boolean = true;
    public orderPriority: number;
    public matrix: any;
    public ptscale: number;
    public dim = 0;
    public alpha = 1;

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentSharedSource]);
        this.program = this.programInfo.program;

        this.centerLocation = gl.getAttribLocation(this.program, "a_center");
        this.deltaLocation = gl.getAttribLocation(this.program, "a_delta");
        this.deltaptLocation = gl.getAttribLocation(this.program, "a_deltapt");
        this.colorLocation = gl.getAttribLocation(this.program, "a_color");
        this.skipdimLocation = gl.getAttribLocation(this.program, "a_skipdim");
        this.stretchLocation = gl.getAttribLocation(this.program, "a_stretch");
        this.rotateLocation = gl.getAttribLocation(this.program, "a_rotate");
        this.texfixLocation = gl.getAttribLocation(this.program, "a_texfix");
        this.fixdeltaLocation = gl.getAttribLocation(this.program, "a_fixdelta");
        this.fixdeltaptLocation = gl.getAttribLocation(this.program, "a_fixdeltapt");
        this.fixdeltamaxptLocation = gl.getAttribLocation(this.program, "a_fixdeltamaxpt");

        this.centerBuffer = gl.createBuffer();
        this.deltaBuffer = gl.createBuffer();
        this.deltaptBuffer = gl.createBuffer();
        this.colorBuffer = gl.createBuffer();
        this.skipdimBuffer = gl.createBuffer();
        this.stretchBuffer = gl.createBuffer();
        this.rotateBuffer = gl.createBuffer();
        this.texfixBuffer = gl.createBuffer();
        this.fixdeltaBuffer = gl.createBuffer();
        this.fixdeltaptBuffer = gl.createBuffer();
        this.fixdeltamaxptBuffer = gl.createBuffer();
        this.fallBackTexture = gl.createTexture();
    }

    addObject(obj: DrawerObject) {
        const item = obj as DrawerObjectEx;
        if (typeof item.visible === "undefined") item.visible = true;
        item.skipdim = !!item.skipdim;
        item.stretch = !!item.stretch;
        this.objects.push(item);
        this.sortedObjects.push(item);
        if (item.id) this.objectsById.set(item.id, item);
    }

    getObject(id): DrawerObject {
        return this.objectsById.get(id);
    }

    updateVisible(id: string, visible: boolean) {
        const obj = this.objectsById.get(id);
        if (obj.visible !== visible) {
            obj.visible = visible;
            this.groupsDirty = true;
        }
    }

    updateSkipdim(id: string, skipdim: boolean) {
        const obj = this.objectsById.get(id);
        if (obj.skipdim !== skipdim) {
            obj.skipdim = skipdim;
            this.skipdimDirty = true;
        }
    }

    setDimmingForObjects(cb: (objectId: string) => boolean) {
        if (!cb) return;
        this.objects.forEach(o => this.updateSkipdim(o.id, cb(o.id)));
    }

    updateStretch(id: string, stretch: boolean) {
        const obj = this.objectsById.get(id);
        if (obj.stretch !== stretch) {
            obj.stretch = stretch;
            this.stretchDirty = true;
        }
    }

    updateColor(id: string, color: Vec4) {
        const obj = this.objectsById.get(id);
        if (
            !obj.color ||
            obj.color[0] !== color[0] ||
            obj.color[1] !== color[1] ||
            obj.color[2] !== color[2] ||
            obj.color[3] !== color[3]
        ) {
            this.objectsById.get(id).color = color;
            this.colorsDirty = true;
        }
    }

    updateCenter(id: string, center: Vec2) {
        const obj = this.objectsById.get(id);
        if (!obj.center || obj.center[0] !== center[0] || obj.center[1] !== center[1]) {
            this.objectsById.get(id).center = center;
            this.centersDirty = true;
        }
    }

    updateRotation(id: string, rotateRadians: number) {
        const obj = this.objectsById.get(id);
        if (!obj.rotateRadians || obj.rotateRadians[0] !== rotateRadians) {
            this.objectsById.get(id).rotateRadians = rotateRadians;
            this.rotateDirty = true;
        }
    }

    private ensureBuffersAndGroupsInternal() {
        if (this.buffersInitialized) {
            this.populateBuffers();
            this.buffersInitialized = false;
        }
        const resortObect = this.skipdimDirty;
        if (this.groupsDirty || resortObect) {
            this.populateGroups(resortObect);
            this.groupsDirty = false;
        }

        if (this.centersDirty) {
            this.populateCenterBuffer();
            this.centersDirty = false;
        }

        if (this.rotateDirty) {
            this.populateRotateBuffer();
            this.rotateDirty = false;
        }

        if (this.colorsDirty) {
            this.populateColorBuffer();
            this.colorsDirty = false;
        }

        if (this.skipdimDirty) {
            this.populateSkipdimBuffer();
            this.skipdimDirty = false;
        }

        if (this.stretchDirty) {
            this.populateStretchBuffer();
            this.stretchDirty = false;
        }
    }

    protected createTextureForImageObject(source: HTMLImageElement | HTMLCanvasElement): WebGLTexture {
        const { gl } = this;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        if (reduceImageQuality) {
            offscreenCanvasCtx.drawImage(source, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, offscreenCanvas);
            offscreenCanvasCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        } else {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
        }

        logBuffer(source.width * source.height * 2, "image-painter-canvas/imag");
        return texture;
    }

    private populateBuffers() {
        if (isDebug) console.time("RectPainter.populateBuffers");
        const gl = this.gl;

        //const centers: number[] = [];
        const deltas: number[] = [];
        const deltaPts: number[] = [];
        const rotates: number[] = [];
        const texcoords: number[] = [];
        const texfixes: number[] = [];
        const fixdeltas: number[] = [];
        const fixdeltapts: number[] = [];
        const fixdeltamaxpts: number[] = [];

        const sprite = new Sprite();

        // sort objects
        //this.objects.sort((a, b) => a.order - b.order);
        // set index
        for (let i = 0; i < this.objects.length; i++) {
            const obj = this.objects[i];
            obj.index = i;
            if (obj.img) {
                obj.texture = this.createTextureForImageObject(obj.img);
            }
        }

        // populate sprite
        for (let w of this.objects) {
            if (!w.canvasTmp) continue;
            w.spriteItem = sprite.addCanvas(w.canvasTmp);
            // destroy it from memory
            delete w.canvasTmp;
        }

        const canvases = sprite.generateSpriteCanvases();
        const canvasIdToTexture = new Map<string, WebGLTexture>();
        // create texture per canvas
        for (const c of canvases) {
            const canvas = c();
            const texture = this.createTextureForImageObject(canvas);
            canvasIdToTexture.set(canvas.id, texture);
        }

        // eslint-disable-next-line
        {
            gl.bindTexture(gl.TEXTURE_2D, this.fallBackTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
        }

        for (let w of this.objects) {
            if (!w.spriteItem) continue;
            w.texture = canvasIdToTexture.get(w.spriteItem.containerCanvasId);
        }

        // __logger.log('aaa', this.objects.filter(x => x.texture).length);

        for (let i = 0; i < this.objects.length; i++) {
            const w = this.objects[i];
            // 4 vec2
            // centers.push(...w.center, ...w.center, ...w.center, ...w.center);
            // preare points x1, y1, ... xp1, yp1
            const d = w.deltas || [0, 0, 0, 0];
            const x1 = d[0],
                y1 = d[1],
                x2 = d[2],
                y2 = d[3];
            const dp = w.deltaPts || [0, 0, 0, 0];
            const scale = w.scalePts || 1;
            const xp1 = dp[0] * scale,
                yp1 = dp[1] * scale,
                xp2 = dp[2] * scale,
                yp2 = dp[3] * scale;

            const texRect = w.img ? Rect.fromXywh(0, 0, w.imgWidth, w.imgHeight) : w.spriteItem?.rect;

            // 4 vec2
            // eslint-disable-next-line
            {
                deltas.push(x1, y1, x2, y1, x1, y2, x2, y2);
            }
            // 4 vec2
            // eslint-disable-next-line
            {
                deltaPts.push(xp1, yp1, xp2, yp1, xp1, yp2, xp2, yp2);
            }
            // 4 vec2
            // eslint-disable-next-line
            {
                const angleInRadians = w.rotateRadians || 0;
                const r = [Math.sin(angleInRadians), Math.cos(angleInRadians)];
                rotates.push(...r, ...r, ...r, ...r);
            }
            // 4 vec2
            // eslint-disable-next-line
            {
                if (!w.spriteItem) {
                    texcoords.push(0, 0, 0, 0, 0, 0, 0, 0);
                } else {
                    const r = w.spriteItem.rect;
                    texcoords.push(r.x1, r.y1, r.x2, r.y1, r.x1, r.y2, r.x2, r.y2);
                }
            }
            // texfix 4 vec2
            // eslint-disable-next-line
            {
                let val: Vec2;
                if (!texRect) {
                    val = [0, 0];
                } else if (w.texPosition === "center") {
                    val = [texRect.cx, texRect.cy];
                } else if (w.texPosition === "lefttop") {
                    val = [texRect.x1, texRect.y1];
                } else {
                    val = [texRect.x2, texRect.y1];
                }

                texfixes.push(...val, ...val, ...val, ...val);
            }
            // fixdelta 4 vec2
            // eslint-disable-next-line
            {
                let val: Vec2;
                if (!texRect || w.texPosition === "center") {
                    val = [0, 0];
                } else if (w.texPosition === "lefttop") {
                    val = [x1, y1];
                } else {
                    val = [x2, y1];
                }
                fixdeltas.push(...val, ...val, ...val, ...val);
            }

            // fixdeltapt 4 vec2
            // eslint-disable-next-line
            {
                let val: Vec2;
                if (!texRect || w.texPosition === "center") {
                    val = [0, 0];
                } else if (w.texPosition === "lefttop") {
                    val = [xp1, yp1];
                } else {
                    val = [xp2, yp1];
                }
                fixdeltapts.push(...val, ...val, ...val, ...val);
            }

            // fixdeltamaxpt 4 vec2
            // eslint-disable-next-line
            {
                let val: Vec2;
                if (!texRect || w.texPosition === "center") {
                    val = [0, 0];
                } else if (w.texPosition === "lefttop") {
                    val = [texRect.w, texRect.h];
                } else {
                    val = [-texRect.w, -texRect.h];
                }
                fixdeltamaxpts.push(...val, ...val, ...val, ...val);
            }
        }

        // this.bufferFloat32Array(this.centerBuffer, centers);
        this.bufferFloat32Array(this.deltaBuffer, deltas);
        this.bufferFloat32Array(this.deltaptBuffer, deltaPts);
        this.bufferFloat32Array(this.rotateBuffer, rotates);
        this.bufferFloat32Array(this.texfixBuffer, texfixes);
        this.bufferFloat32Array(this.fixdeltaBuffer, fixdeltas);
        this.bufferFloat32Array(this.fixdeltaptBuffer, fixdeltapts);
        this.bufferFloat32Array(this.fixdeltamaxptBuffer, fixdeltamaxpts);

        this.populateCenterBuffer();
        this.populateColorBuffer();
        this.populateSkipdimBuffer();
        this.populateStretchBuffer();

        if (isDebug) console.timeEnd("RectPainter.populateBuffers");
    }

    private populateCenterBuffer() {
        const centers: number[] = [];
        for (const w of this.objects) {
            // const c = w.color || [0, 0, 0, 0];
            centers.push(...w.center, ...w.center, ...w.center, ...w.center);
        }

        this.bufferFloat32Array(this.centerBuffer, centers);
    }

    private populateRotateBuffer() {
        const rotations: number[] = [];
        for (const w of this.objects) {
            const angleInRadians = w.rotateRadians || 0;
            const r = [Math.sin(angleInRadians), Math.cos(angleInRadians)];
            rotations.push(...r, ...r, ...r, ...r);
        }

        this.bufferFloat32Array(this.rotateBuffer, rotations);
    }
    private populateColorBuffer() {
        const colors: number[] = [];
        for (const w of this.objects) {
            const c = w.color || [0, 0, 0, 0];
            colors.push(...c, ...c, ...c, ...c);
        }

        this.bufferFloat32Array(this.colorBuffer, colors);
    }

    private populateSkipdimBuffer() {
        const skipdims: number[] = [];
        for (const w of this.objects) {
            const c = w.skipdim ? 1 : 0;
            skipdims.push(c, c, c, c);
        }

        this.bufferFloat32Array(this.skipdimBuffer, skipdims);
    }

    private populateStretchBuffer() {
        const stretchs: number[] = [];
        for (const w of this.objects) {
            const c = w.stretch ? 1 : 0;
            stretchs.push(c, c, c, c);
        }

        this.bufferFloat32Array(this.stretchBuffer, stretchs);
    }

    private populateGroups(resortObejcts: boolean) {
        // __logger.log('this.populateGroups', this.indexBufferPool.length);
        const groups: { indices: number[]; texture: WebGLTexture; texsize: Vec2; rotated: boolean }[] = [];
        let currentGroup: { indices: number[]; texture: WebGLTexture; texsize: Vec2; rotated: boolean };

        if (resortObejcts) {
            this.sortedObjects.sort((a, b) => (a.skipdim ? 1 : 0) - (b.skipdim ? 1 : 0));
        }

        for (const obj of this.sortedObjects) {
            //obj.index = i;
            if (!obj.visible) continue;
            const rotated = !!obj.rotateRadians;
            if (
                !currentGroup ||
                (currentGroup.texture &&
                    obj.texture &&
                    (currentGroup.texture !== obj.texture || currentGroup.rotated !== rotated))
            ) {
                currentGroup = { indices: [], texture: undefined, texsize: undefined, rotated };
                groups.push(currentGroup);
            }

            if (obj.texture && !currentGroup.texture) {
                currentGroup.texture = obj.texture;
                let w: number, h: number;
                if (obj.img) {
                    w = obj.imgWidth;
                    h = obj.imgHeight;
                } else {
                    w = obj.spriteItem.containerCanvasWidth;
                    h = obj.spriteItem.containerCanvasHeight;
                }
                currentGroup.texsize = [w, h];
            }

            currentGroup.indices.push(obj.index);
        }

        const indexBuffers: WebGLBuffer[] = [];
        this.groups.length = 0;

        this.indexBuffersAreUint = this.sortedObjects.length * 4 > 65535;
        const ArType = this.indexBuffersAreUint ? Uint32Array : Uint16Array;

        for (let group of groups) {
            const buffer = this.indexBufferPool.shift() || this.gl.createBuffer();
            indexBuffers.push(buffer);

            const realIndices = [];
            for (let i of group.indices) {
                const n = i * 4;
                realIndices.push(n, n + 1, n + 2, n + 1, n + 2, n + 3);
            }

            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new ArType(realIndices), this.gl.DYNAMIC_DRAW);

            this.groups.push({
                texture: group.texture,
                indexBuffer: buffer,
                numElements: realIndices.length,
                texsize: group.texsize,
                rotated: group.rotated,
            });
        }

        this.indexBufferPool.unshift(...indexBuffers);
    }

    private bufferFloat32Array(buffer: WebGLBuffer, data: number[]) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
        logBuffer(data.length * 4, "image-painter-buffer");
    }

    private enableBuffer(buffer: WebGLBuffer, location: number, size: 1 | 2 | 3 | 4) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.enableVertexAttribArray(location);
        this.gl.vertexAttribPointer(location, size, this.gl.FLOAT, false, 0, 0);
    }

    preparePaint() {
        this.gl.useProgram(this.program);
        this.ensureBuffersAndGroupsInternal();
    }

    paint() {
        if (this.alpha < 0.05 || !this.visible) return;
        const gl = this.gl;

        this.preparePaint();

        this.enableBuffer(this.centerBuffer, this.centerLocation, 2);
        this.enableBuffer(this.deltaBuffer, this.deltaLocation, 2);
        this.enableBuffer(this.deltaptBuffer, this.deltaptLocation, 2);
        this.enableBuffer(this.colorBuffer, this.colorLocation, 4);
        this.enableBuffer(this.skipdimBuffer, this.skipdimLocation, 1);
        this.enableBuffer(this.stretchBuffer, this.stretchLocation, 1);
        this.enableBuffer(this.rotateBuffer, this.rotateLocation, 2);
        this.enableBuffer(this.texfixBuffer, this.texfixLocation, 2);
        this.enableBuffer(this.fixdeltaBuffer, this.fixdeltaLocation, 2);
        this.enableBuffer(this.fixdeltaptBuffer, this.fixdeltaptLocation, 2);
        this.enableBuffer(this.fixdeltamaxptBuffer, this.fixdeltamaxptLocation, 2);

        for (let group of this.groups) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, group.indexBuffer);

            const uniforms = {
                u_matrix: this.matrix,
                u_ptscale: [this.ptscale, this.ptscale],
                u_dim: this.dim,
                u_alpha: this.alpha,
            } as any;

            if (group.texture) {
                uniforms.u_texture = group.texture;
                uniforms.u_texsize = group.texsize;

                gl.bindTexture(gl.TEXTURE_2D, group.texture);
                if (group.rotated) {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                } else {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                }
            } else {
                uniforms.u_texture = this.fallBackTexture;
            }

            twgl.setUniforms(this.programInfo, uniforms);

            // console.log("zzz", group.numElements, group.indexBufferIsUint);
            gl.drawElements(gl.TRIANGLES, group.numElements, this.indexBuffersAreUint ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, 0);
        }
    }
}

export interface DrawerObjectEx extends DrawerObject {
    texture?: WebGLTexture;
    texcoords: Vec4; // x1, y1, x2, y2
    index: number;
    img: HTMLImageElement;
    imgWidth: number;
    imgHeight: number;
}

interface DrawerGroup {
    texsize: Vec2;
    texture: WebGLTexture;
    indexBuffer: WebGLBuffer;
    numElements: number;
    rotated: boolean;
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
attribute float a_skipdim;
attribute float a_stretch;

uniform mat4 u_matrix;   
uniform vec2 u_ptscale; 
uniform vec2 u_texsize;
uniform float u_dim;

varying vec2 v_texcoord;
varying vec4 v_color;

varying float v_dim;

void main() {
    vec2 delta = a_delta + a_deltapt * u_ptscale;

    vec2 fixdelta = a_fixdelta + a_fixdeltapt * u_ptscale;

    // calc maxdelta from a_fixdeltamaxpt
    // this is relative to fix point (on svg)
    vec2 fixdeltamax = a_fixdeltamaxpt * u_ptscale;
    vec2 deltamax = fixdeltamax + fixdelta;
    if (a_fixdeltamaxpt.x > 0.0) {
        delta = vec2(min(delta.x, deltamax.x), min(delta.y, deltamax.y));
    } else if (a_fixdeltamaxpt.x < 0.0) {
        delta = vec2(max(delta.x, deltamax.x), max(delta.y, deltamax.y));
    }

    vec2 diff = delta - fixdelta;
    vec2 texdeltapt = a_stretch > 0.0 ? diff : diff / u_ptscale;
    vec2 texcoord = a_texfix + texdeltapt;

    vec2 rotatedDelta =  vec2(
        delta.x * a_rotate.y + delta.y * a_rotate.x,
        delta.y * a_rotate.y - delta.x * a_rotate.x);
    gl_Position = u_matrix * vec4(a_center + rotatedDelta, 0, 1);

    v_texcoord =  texcoord / u_texsize;
    v_color = a_color;
    v_dim = a_skipdim > 0.0 ? 0.0 : u_dim;
}`;

// https://gamedev.stackexchange.com/questions/59797/glsl-shader-change-hue-saturation-brightness
// https://github.com/jamieowen/glsl-blend/blob/master/_temp/conversion/desaturate.glsl
const fragmentSharedSource = `precision mediump float;
varying vec2 v_texcoord;
varying vec4 v_color;
uniform sampler2D u_texture;
uniform float u_alpha;
varying float v_dim; 

${dimColor}

void main() {
    vec4 col;
    if (v_color.w != 0.0) {
        col = v_color; 
    } else {
        col = texture2D(u_texture, v_texcoord);
    }
    if (v_dim > 0.0) {
        col = dimColor(col, v_dim);
    }
    if (u_alpha != 1.0){
        col *= u_alpha;
    }
    gl_FragColor = col;
}`;
