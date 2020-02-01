import { observable, reaction, runInAction } from "mobx";
import Rect from "../../core/Rect";
import Size from "../../core/Size";
import logger from "../../tools/logger";
import { Drawer, DrawerUpdatables, DrawerLayer } from "../DrawerInterfaces";
import configAll from "./config/config-all";
import Painter from "./Painter";

export default class DrawerImpl implements Drawer, DrawerUpdatables {
    private readonly gl: WebGLRenderingContext;
    private requireCanvasSizing = true;
    private requestedFrame: number;
    private readonly updateQueue = new Set<() => void>();
    private readonly paintersByType = new Map<string, Painter>();
    // private prepared: boolean;

    private readonly drawBound: () => void;
    private readonly disposers: (() => void)[] = [];

    // updatables
    @observable matrix: Float32Array;
    @observable ptscale: number;
    @observable canvasVisibleRectPt: Rect;
    @observable canvasSizePt: Size;
    @observable dimmed: boolean;

    public readonly allPainters: Painter[] = [];

    constructor(
        private canvas: HTMLCanvasElement,
        private pixelRatio: number,
        u: DrawerUpdatables,
        public layers: DrawerLayer[],
        public svgLegacy: SvgLegacy
    ) {
        this.setUpdatables(u);
        this.gl = createGl(canvas);
        this.drawBound = this.draw.bind(this);

        // init all layers and all
        this.disposers.push(configAll(this));

        for (var d of this.allPainters) {
            d.preparePaint();
        }

        this.draw();

        // do all autoruns here
        this.disposers.push(
            reaction(
                () => this.canvasSizePt,
                () => {
                    this.requireCanvasSizing = true;
                    this.requireRedraw();
                }
            )
        );
    }

    dispose() {
        this.disposers.forEach(x => x());
    }

    setUpdatables(u: DrawerUpdatables) {
        runInAction("setUpdatables", () => {
            // console.log("setUpdatables", this.matrix === u.matrix);
            this.matrix = u.matrix;
            this.ptscale = u.ptscale;
            this.canvasVisibleRectPt = u.canvasVisibleRectPt;
            this.canvasSizePt = u.canvasSizePt;
        });
    }

    // called by consumer when it resizes things
    private setCanvasSize() {
        const size = this.canvasSizePt; //.scale(this.pixelRatio);
        this.canvas.width = size.width;
        this.canvas.height = size.height;
        this.gl.viewport(0, 0, size.width, size.height);
        this.requireCanvasSizing = false;
    }

    // private prepare() {
    //     // console.log('Prepare painters');
    //     const cb = configAll(this);

    //     for (var d of this.allPainters) {
    //         d.preparePaint();
    //     }

    //     cb();
    //     this.prepared = true;
    // }

    private requireRedraw() {
        if (!this.requestedFrame) this.requestedFrame = window.requestAnimationFrame(this.drawBound);
    }

    public draw() {
        if (this.requireCanvasSizing) this.setCanvasSize();
        // if (!this.prepared) this.prepare();
        //showFps();
        //benchFrames++;
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

    requireUpdate(func: () => void): void {
        if (func) this.updateQueue.add(func);
        this.requireRedraw();
    }

    requirePainter<T extends Painter>(
        id: string,
        TypeClass?: new (gl: WebGLRenderingContext) => T,
        painterOrderPriority?: number
    ): T {
        let d = this.paintersByType.get(id) as T;
        if (!d && TypeClass) {
            logger.log("Creating painter", id);
            d = new TypeClass(this.gl);
            d.orderPriority = painterOrderPriority;
            this.paintersByType.set(id, d);
            this.allPainters.push(d);
            this.allPainters.sort((a, b) => a.orderPriority - b.orderPriority);
        }
        return d;
    }
}

function createGl(canvas: HTMLCanvasElement) {
    // throw new Error('aaa')
    const options = {};
    let gl = canvas.getContext("webgl2", options) as WebGLRenderingContext;
    if (!gl) {
        gl = canvas.getContext("webgl", options) || (canvas.getContext("experimental-webgl", options) as any);
        if (!gl) return;
        const ext = gl.getExtension("OES_element_index_uint");
        if (!ext) logger.warn("OES_element_index_uint not supported");
    }
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    logger.log("GPU vendor:", vendor);
    logger.log("GPU renderer:", renderer);
    logger.log("GL version:", gl.getParameter(gl.VERSION));
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true as any);
    // gl.enable(gl.DEPTH_TEST);
    // gl.depthFunc(gl.ALWAYS);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // gl.colorMask(true, true, true, false);
    return gl;
}
