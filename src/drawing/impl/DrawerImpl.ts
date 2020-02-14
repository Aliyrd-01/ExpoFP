import { observable, reaction, runInAction } from "mobx";
import { BoothStateProvider, RegularBooth, SpecialBooth } from "../../core/Booth";
import Rect from "../../core/Rect";
import Size from "../../core/Size";
import logger from "../../tools/logger";
import { BoothStateSeriazable, Drawer, DrawerConfig, DrawerUpdatables } from "../DrawerInterfaces";
import configAll from "./config/config-all";
import Painter from "./painters/Painter";

export interface DrawerImplConfig extends Omit<DrawerConfig, "meshUrl" | "canvas" | "__efpDebug"> {
    canvas: OffscreenCanvas | HTMLCanvasElement;
    mesh: SvgMeshJson;
}

export default class DrawerImpl implements Drawer, BoothStateProvider {
    private readonly gl: WebGLRenderingContext;
    private requireCanvasSizing = true;
    private requestedFrame: number;
    private readonly updateQueue = new Set<() => void>();
    private readonly paintersByType = new Map<string, Painter>();
    private drawing: boolean;

    private readonly drawBound: () => void;
    private readonly disposers: (() => void)[] = [];

    // booths: DrawerBoothImpl[];

    // updatables
    @observable.ref matrix: Float32Array;
    @observable ptscale: number;
    @observable canvasVisibleRectPt: Rect;
    @observable canvasSizePt: Size;
    @observable dimmed: boolean;
    @observable.ref listBoothNames: Set<string>;
    @observable.ref hoveredBoothNames: Set<string>;
    @observable.ref selectedBoothNames: Set<string>;
    @observable.ref bookmarkedBoothNames: Set<string>;
    @observable.ref exhibitorIdsByBoothNameMap: Map<string, number[]>;

    public readonly allPainters: Painter[] = [];

    constructor(
        // private readonly canvas: HTMLCanvasElement | OffscreenCanvas,
        // public readonly pixelRatio: number,
        // public readonly config: DrawerConfig,
        // public readonly svg: SvgJson,
        // public readonly mesh: SvgMeshJson,
        // public readonly booths: Booth[]
        public config: DrawerImplConfig
    ) {
        this.gl = createGl(config.canvas);
        this.drawBound = this.draw.bind(this);

        // const state: BoothStateProvider = observable({

        // });

        config.booths.forEach(b => {
            Object.setPrototypeOf(b, b.special === true ? SpecialBooth.prototype : RegularBooth.prototype);
            Object.setPrototypeOf(b.rect, Rect.prototype);

            b.state = this;
        });

        // this.booths = booths.map(b => {
        //     if (b.special === undefined) {
        //         return Object.setPrototypeOf(b, DrawerRegularBoothImpl.prototype) as DrawerRegularBoothImpl;
        //     }
        //     return Object.setPrototypeOf(b, DrawerSpecialBoothImpl.prototype) as DrawerSpecialBoothImpl;
        // });
    }

    dispose() {
        this.disposers.forEach(x => x());
        this.allPainters.forEach(p => p.dispose());
        // const looseContextExt = this.gl.getExtension("WEBGL_lose_context");
        // if (!looseContextExt) logger.warn("No WEBGL_lose_context");
        // else looseContextExt.loseContext();
    }

    setUpdatables(u: DrawerUpdatables) {
        runInAction("setUpdatables", () => {
            // console.log("setUpdatables", this.matrix === u.matrix);
            if (u.dimmed !== undefined) this.dimmed = u.dimmed;
            if (u.matrix !== undefined) this.matrix = u.matrix;
            if (u.ptscale !== undefined) this.ptscale = u.ptscale;
            if (u.canvasVisibleRectPt !== undefined) {
                Object.setPrototypeOf(u.canvasVisibleRectPt, Rect.prototype);
                this.canvasVisibleRectPt = u.canvasVisibleRectPt;
            }
            if (u.canvasSizePt !== undefined) {
                Object.setPrototypeOf(u.canvasSizePt, Size.prototype);
                this.canvasSizePt = u.canvasSizePt;
            }
            for (const a of [
                "listBoothNames",
                "hoveredBoothNames",
                "selectedBoothNames",
                "bookmarkedBoothNames",
                "exhibitorIdsByBoothNameMap"
            ] as (keyof BoothStateSeriazable)[]) {
                const val = u[a];
                if (val !== undefined) {
                    const Class = a.endsWith("Map") ? Map : (Set as any);
                    this[a] = new Class(val);
                }
            }
        });

        if (!this.drawing) {
            this.drawing = true;

            // this.booths.forEach(b => {
            //     console.log(b.state.exhibitorIdsByBoothNameMap);
            //     debugger;
            // });

            this.draw();

            // init all layers and all
            this.disposers.push(configAll(this));

            for (var d of this.allPainters) {
                d.preparePaint();
            }

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
    }

    // called by consumer when it resizes things
    private setCanvasSize() {
        const size = this.canvasSizePt; //.scale(this.pixelRatio);
        this.config.canvas.width = size.width;
        this.config.canvas.height = size.height;
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
        if (!this.requestedFrame) this.requestedFrame = requestAnimationFrame(this.drawBound);
    }

    private draw() {
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

function createGl(canvas: HTMLCanvasElement | OffscreenCanvas) {
    // throw new Error('aaa')
    const options = {};
    let gl = canvas.getContext("webgl2", options) as WebGLRenderingContext;
    if (!gl) {
        gl = canvas.getContext("webgl", options) || (canvas.getContext("experimental-webgl" as any, options) as any);
        if (!gl) return;
        const ext = gl.getExtension("OES_element_index_uint");
        if (!ext) logger.warn("OES_element_index_uint not supported");
    }
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    logger.log("GPU renderer:", renderer);
    logger.log("GPU vendor:", vendor);
    logger.log("GL version:", gl.getParameter(gl.VERSION));
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true as any);
    // gl.enable(gl.DEPTH_TEST);
    // gl.depthFunc(gl.ALWAYS);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // gl.colorMask(true, true, true, false);
    return gl;
}
