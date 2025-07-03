import Size from "../../../core/Size";
import { setContext } from "../../../store/LayerStore";
import logger from "../../../tools/logger";
import isDebug from "../../../utils/is-debug";
import configAll from "./config/config-all";
import Matrix from "./Matrix";
import Painter, { PainterConstructor } from "./painters/Painter";

export type Drawer = Pick<
    DrawerImpl,
    | "setVisibleRect"
    | "setZoomTransform"
    | "ptscale"
    | "getSvgPxUnzoomedMatrix"
    | "getSvgPxUnzoomedScale"
    | "getZoomTransform"
    | "getPxSvgMatrix"
    | "getVisibleRect"
    | "resetCanvasSize"
    | "setPixelRatio"
    | "setVisibleScale"
    | "draw"
    | "pixelRatio"
    | "setPainterVisibility"
>;

export type DrawerContext = Pick<
    DrawerImpl,
    | "ptscale"
    | "pixelRatio"
    | "updatable"
    | "allPainters"
    | "requirePainter"
    | "requireUpdate"
    | "getVisibleScale"
    | "setVisibleScale"
    // | "getVisibleRect"
    // | "getCanvasSize"
    | "subscribeMatrixChange"
    | "getMatrix"
    | "updateMatrixScale"
    | "getLayersPainters"
    // | "subscribePtscaleChange"
>;

export default function createDrawer(canvas: HTMLCanvasElement, updatable: boolean) {
    return new DrawerImpl(canvas, updatable) as Drawer;
}

export class DrawerImpl extends Matrix {
    private readonly canvas: HTMLCanvasElement;
    private requestedFrame: number;
    private readonly updateQueue = new Set<() => void>();
    private readonly paintersByType = new Map<string, Painter>();
    readonly allPainters: Painter[] = [];
    readonly updatable: boolean;
    private prepared: boolean;
    private gl: WebGLRenderingContext;
    private readonly drawBound: () => void;

    constructor(canvas: HTMLCanvasElement, updatable: boolean) {
        super(new Size(canvas.width, canvas.height));
        // this.setVisibleScale(0.96);
        this.setVisibleScale(1);
        this.canvas = canvas;
        this.updatable = updatable;

        this.gl = createGl(this.canvas);
        this.drawBound = this.draw.bind(this);
        this.updateMatrixScale = this.updateMatrixScale.bind(this);

        if (!updatable) this.requireUpdate = null;

        // configure all objects there
        if (updatable) {
            this.prepare();
            this.requireRedraw();
        }
    }

    // called by consumer when it resizes things
    resetCanvasSize() {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.setCanvasSize(new Size(this.canvas.width, this.canvas.height));
    }

    private prepare() {
        // console.log('Prepare painters');
        configAll(this as DrawerContext);
        setContext(this as DrawerContext);

        for (var d of this.allPainters) d.preparePaint();

        this.prepared = true;
    }

    private requireRedraw() {
        if (!this.requestedFrame) this.requestedFrame = window.requestAnimationFrame(this.drawBound);
    }

    public draw() {
        if (!this.prepared) this.prepare();
        showFps();
        benchFrames++;
        this.requestedFrame = undefined;

        const queue = Array.from(this.updateQueue);
        this.updateQueue.clear();

        for (const u of queue) {
            u();
        }

        for (var d of this.allPainters) {
            d.paint();
        }
        //this.requireRedraw();
    }

    public setPainterVisibility(layer: string, visible: boolean) {
        this.paintersByType.forEach((painter, key) => {
            if (key.startsWith(layer + ":") && painter.visible !== visible) painter.visible = visible;
        });
    }

    public updateMatrixScale() {
        // __logger.log('matrix change', m.getZoomTransform())
        for (const d of this.allPainters) {
            d.matrix = this.getMatrix();
            d.ptscale = this.ptscale;
        }
    }

    public getLayersPainters(layers: string[]): Painter[] {
        return this.allPainters.filter((p) => !!layers.find((l) => p.id.startsWith(l)));
    }

    //////////////////
    // DrawerContext
    requireUpdate(func: () => void): void {
        if (func) this.updateQueue.add(func);
        this.requireRedraw();
    }

    requirePainter<T extends Painter, U>(
        id: string,
        TypeClass: PainterConstructor<T, U>,
        painterOrderPriority: number,
        visible: boolean,
        options?: U,
    ): T {
        let d = this.paintersByType.get(id) as T;
        if (!d && TypeClass) {
            d = new TypeClass(this.gl, options);
            d.id = id;
            d.orderPriority = painterOrderPriority;
            d.visible = visible;
            d.matrix = this.getMatrix();
            d.ptscale = this.ptscale;
            this.paintersByType.set(id, d);
            this.allPainters.push(d);
            this.allPainters.sort((a, b) => a.orderPriority - b.orderPriority);
        }
        return d;
    }
    //////////////////
}

let then = 0;
let prevFps = [];
let prevHtml = "";
function showFps() {
    if (!isDebug) return;

    const now = performance.now() * 0.001;
    let deltaTime = now - then;

    // Skip if too much time passed (tab was inactive)
    if (deltaTime > 1) {
        then = now;
        return;
    }

    // Clamp deltaTime to prevent extreme FPS values
    const MIN_DELTA_TIME = 0.001; // 1000 FPS cap
    deltaTime = Math.max(deltaTime, MIN_DELTA_TIME);

    // Calculate FPS (capped at a reasonable value)
    const MAX_REASONABLE_FPS = 200;
    const fps = Math.min(Math.round(1 / deltaTime), MAX_REASONABLE_FPS);

    // Store FPS in rolling window
    prevFps.push(fps);
    if (prevFps.length > 20) prevFps.shift();

    // Compute average FPS
    const avgFps = prevFps.reduce((sum, el) => sum + el, 0) / prevFps.length;
    const html = avgFps.toFixed(0);

    // Update DOM only if changed
    if (prevHtml !== html) {
        const fpsElement = window["__efpElement"]?.children?.[0]?.shadowRoot?.getElementById?.("fps");
        if (fpsElement) {
            fpsElement.innerHTML = html;
            prevHtml = html;
        }
    }

    then = now;
}

function createGl(canvas: HTMLCanvasElement) {
    // throw new Error('aaa')
    const options = {};
    let gl = canvas.getContext("webgl2", options) as WebGLRenderingContext;
    if (!gl) {
        gl = canvas.getContext("webgl", options) || (canvas.getContext("experimental-webgl", options) as any);
        if (!gl) throw new Error("WebGL not supported");
        const ext = gl.getExtension("OES_element_index_uint");
        if (!ext) logger.warn("OES_element_index_uint not supported");
    }
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
        logger.log("GPU vendor:", gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
        logger.log("GPU renderer:", gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
    }
    logger.log("GL version:", gl.getParameter(gl.VERSION));
    logger.log("GL MAX_TEXTURE_SIZE", gl.getParameter(gl.MAX_TEXTURE_SIZE));
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    // gl.enable(gl.DEPTH_TEST);
    // gl.depthFunc(gl.ALWAYS);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // gl.colorMask(true, true, true, false);
    return gl;
}

// eslint-disable-next-line
let benchFrames = 0;
// window['startBench'] = function () {
//     benchFrames = 0;
//     console.time('bench');

//     const exhibitorId = store.getters.exhibitorsArray[0].id;
//     const exhibitorId2 = store.getters.exhibitorsArray[1].id;

//     const n = 500;
//     let steps = [
//         [() => store.commit('setList', { "type": "search", "text": "a", "focused": true }), n],
//         [() => store.commit('setCenterMap', true), n],
//         [() => store.dispatch('clickExhibitor', exhibitorId), n],
//         [() => store.commit('setCenterMap', true), n],
//         [() => store.dispatch('clickExhibitor', exhibitorId2), n],
//         [() => store.dispatch('selectNone'), n],
//         [() => store.dispatch('selectSearch', ''), n],
//         [() => store.commit('setZoomBy', 1), n],
//         [() => store.commit('setZoomBy', 1), n],
//         [() => store.commit('setZoomBy', 1), n],
//         [() => store.commit('setZoomBy', 1), n],
//         [() => store.commit('setCenterMap', true), n],
//         [() => store.commit('setZoomBy', -1), n],
//         [() => store.commit('setZoomBy', -1), n],
//         [() => store.commit('setZoomBy', -1), n],
//         [() => store.commit('setCenterMap', true), n]
//     ];
//     steps = [...steps];
//     doSteps(steps as any, () => {
//         console.log('total frames:', benchFrames);
//         window.setTimeout(() => alert(benchFrames), 1000);
//         console.timeEnd('bench');
//     });

//     function doSteps(ar: [() => void, number][], cb: () => void) {
//         const s = ar.shift();
//         s[0]();
//         if (ar.length) {
//             window.setTimeout(() => doSteps(ar, cb), s[1]);
//         } else {
//             cb();
//         }
//     }
// }
