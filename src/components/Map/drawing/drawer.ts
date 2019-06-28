import Matrix from "./Matrix";
import configAll from "./config/config-all";

export type Drawer = Pick<DrawerImpl,
    'setVisibleRect'
    | 'setZoomTransform'
    | 'getPtscale'
    | 'getSvgPxUnzoomedMatrix'
    | 'getZoomTransform'
    | 'getPxSvgMatrix'
    | 'getVisibleRect'
    | 'resetCanvasSize'
    | 'setPixelRatio'
>;

export type DrawerContext = Pick<DrawerImpl,
    'getPtscale'
    | 'pixelRatio'
    | 'updatable'
    | 'allPainters'
    | 'requirePainter'
    | 'requireUpdate'
    | 'getVisibleScale'
    | 'setVisibleScale'
    | 'subscribeMatrixChange'
    | 'getMatrix'
    | 'subscribePtscaleChange'
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
    pixelRatio = devicePixelRatio;
    private gl: WebGLRenderingContext;
    private readonly drawBound: () => void;

    constructor(canvas: HTMLCanvasElement, updatable: boolean) {
        super(new Size(canvas.width, canvas.height));
        this.setVisibleScale(0.96);
        this.canvas = canvas;
        this.updatable = updatable;

        this.gl = createGl(this.canvas);
        this.drawBound = this.draw.bind(this);

        if (!updatable) this.requireUpdate = null;

        // configure all objects there
        const cb = configAll(this as DrawerContext);

        for (var d of this.allPainters) {
            d.preparePaint();
        }

        cb();

        this.requireRedraw();
    }

    // called by consumer when it resizes things
    resetCanvasSize() {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.setCanvasSize(new Size(this.canvas.width, this.canvas.height));
    }

    private requireRedraw() {
        if (!this.requestedFrame) this.requestedFrame = window.requestAnimationFrame(this.drawBound);
    }

    private draw() {
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

    //////////////////
    // DrawerContext
    requireUpdate(func: () => void): void {
        if (func) this.updateQueue.add(func);
        this.requireRedraw();
    }

    requirePainter<T extends Painter>(id: string, TypeClass?: new (gl: WebGLRenderingContext) => T, painterOrderPriority?: number): T {
        let d = this.paintersByType.get(id) as T;
        if (!d && TypeClass) {
            d = new TypeClass(this.gl);
            d.orderPriority = painterOrderPriority;
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
    if (!__settings.debug) return;
    const now = performance.now() * 0.001;
    const deltaTime = now - then;
    then = now;
    const roundTo = 2;
    const fps = Math.round(1 / deltaTime / roundTo) * roundTo;
    prevFps.push(fps);
    if (prevFps.length > 20) prevFps.shift();
    const avgFps = prevFps.reduce((sume, el) => sume + el, 0) / prevFps.length;
    const html = avgFps.toFixed(0);
    if (prevHtml !== html) {
        document.getElementById("fps").innerHTML = html;
        prevHtml = html;
    }
}

function createGl(canvas: HTMLCanvasElement) {
    // throw new Error('aaa')
    const options = {};
    let gl = canvas.getContext("webgl2", options) as WebGLRenderingContext;
    if (!gl) {
        gl = canvas.getContext("webgl", options) || (canvas.getContext("experimental-webgl", options) as any);
        if (!gl) return;
        const ext = gl.getExtension('OES_element_index_uint');
        if (!ext) __logger.warn('OES_element_index_uint not supported');
    }
    __logger.log('GL', gl.getParameter(gl.VERSION));
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true as any);
    // gl.enable(gl.DEPTH_TEST);
    // gl.depthFunc(gl.ALWAYS);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // gl.colorMask(true, true, true, false);
    return gl;
}


let benchFrames = 0;
window['startBench'] = function () {
    benchFrames = 0;
    console.time('bench');

    const exhibitorId = store.getters.exhibitorsArray[0].id;
    const exhibitorId2 = store.getters.exhibitorsArray[1].id;

    const n = 500;
    let steps = [
        [() => store.commit('setList', { "type": "search", "text": "a", "focused": true }), n],
        [() => store.commit('setCenterMap', true), n],
        [() => store.dispatch('clickExhibitor', exhibitorId), n],
        [() => store.commit('setCenterMap', true), n],
        [() => store.dispatch('clickExhibitor', exhibitorId2), n],
        [() => store.dispatch('selectNone'), n],
        [() => store.dispatch('selectSearch', ''), n],
        [() => store.commit('setZoomBy', 1), n],
        [() => store.commit('setZoomBy', 1), n],
        [() => store.commit('setZoomBy', 1), n],
        [() => store.commit('setZoomBy', 1), n],
        [() => store.commit('setCenterMap', true), n],
        [() => store.commit('setZoomBy', -1), n],
        [() => store.commit('setZoomBy', -1), n],
        [() => store.commit('setZoomBy', -1), n],
        [() => store.commit('setCenterMap', true), n]
    ];
    steps = [...steps];
    doSteps(steps as any, () => {
        console.log('total frames:', benchFrames);
        window.setTimeout(() => alert(benchFrames), 1000);
        console.timeEnd('bench');
    });

    function doSteps(ar: [() => void, number][], cb: () => void) {
        const s = ar.shift();
        s[0]();
        if (ar.length) {
            window.setTimeout(() => doSteps(ar, cb), s[1]);
        } else {
            cb();
        }
    }
}

