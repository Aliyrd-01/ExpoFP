import { ZoomTransform } from "d3-zoom";
import { observable, runInAction } from "mobx";
import { m4 } from "twgl.js";
import Rect from "../core/Rect";
import Size from "../core/Size";
// import { svgArea } from "../data/svg";

export default class Matrix {
    // svg -> -1..1
    @observable.ref matrix: Float32Array;
    // browser px -> svg
    private pxSvgMatrix: Float32Array;
    // canvas point -> svg scale
    @observable ptscaleVal: number;
    // svg -> browser px matrix (unzoomed)
    private svgPxUnzoomedMatrix: Float32Array;

    constructor(
        private canvasSize: Size,
        private visibleRect: Rect,
        private visibleScale: number,
        private svgArea: Rect,
        private zoomTransform: ZoomTransform,
        public pixelRatio: number
    ) {
        this.calcAll();
    }

    //
    // setters
    //
    setZoomTransform(transform: ZoomTransform) {
        // __logger.log('zz', transform);
        this.zoomTransform = transform;
        this.calcAll();
    }

    setVisibleRect(rect: Rect) {
        this.visibleRect = rect;
        this.calcAll();
    }

    setCanvasSize(size: Size) {
        this.canvasSize = size;
        this.calcAll();
    }

    setVisibleScale(scale: number) {
        this.visibleScale = scale;
        this.calcAll();
    }

    setPixelRatio(pixelRatio: number) {
        this.pixelRatio = pixelRatio;
        this.calcAll();
    }

    //
    // getters
    //
    getMatrix() {
        return this.matrix;
    }
    // getPtscale() {
    //     return this.ptscaleVal;
    // }
    // @computed({ keepAlive: true })
    get ptscale() {
        return this.ptscaleVal;
    }
    getPxSvgMatrix() {
        return this.pxSvgMatrix;
    }
    getSvgPxUnzoomedMatrix() {
        return this.svgPxUnzoomedMatrix;
    }
    getSvgPxUnzoomedScale() {
        return this.svgPxUnzoomedMatrix[0];
    }
    getZoomTransform() {
        return this.zoomTransform;
    }
    getVisibleRect() {
        return this.visibleRect;
    }
    getVisibleScale() {
        return this.visibleScale;
    }

    // private matrixChangeSubscribers: ((matrix: Float32Array) => void)[] = [];
    // subscribeMatrixChange(cb: (matrix: Float32Array) => void) {
    //     this.matrixChangeSubscribers.push(cb);
    // }
    // private fireMatrixChange() {
    //     this.matrixChangeSubscribers.forEach(x => x(this.matrix));
    // }

    //
    // core
    //
    private calcAll() {
        // dirty = false;
        const { zoomTransform, visibleRect, visibleScale, canvasSize } = this;

        // console.log('visi', visibleScale)

        //const visibleRectPt = visibleRect.scale(this.pixelRatio);
        const svgPxScaleUnzoomed = Math.min(visibleRect.w / this.svgArea.w, visibleRect.h / this.svgArea.h);
        const svgPxScale = svgPxScaleUnzoomed * visibleScale;

        // console.log('svgPxScaleUnzoomed', svgPxScaleUnzoomed, 'pixelRatio', this.pixelRatio,
        //     'visibleRect', visibleRect.w, 'visibleRect', visibleRect.w);

        //if (!this['updatable']) debugger;

        // create helper matrices
        const zoomMatrix = m4.translation([zoomTransform.x * this.pixelRatio, zoomTransform.y * this.pixelRatio, 0]);
        m4.scale(zoomMatrix, [zoomTransform.k, zoomTransform.k, 1], zoomMatrix);

        // px/svg scale
        const centerSvgMatrix = m4.translation([visibleRect.cx, visibleRect.cy, 0]);
        m4.scale(centerSvgMatrix, [svgPxScaleUnzoomed, svgPxScaleUnzoomed, 1], centerSvgMatrix);
        const centerSvgMatrixWithoutVisibleScale = new Float32Array(centerSvgMatrix);
        m4.scale(centerSvgMatrix, [visibleScale, visibleScale, 1], centerSvgMatrix);
        const moveToCenter = [-this.svgArea.cx, -this.svgArea.cy, 0];
        m4.translate(centerSvgMatrix, moveToCenter, centerSvgMatrix);
        m4.translate(centerSvgMatrixWithoutVisibleScale, moveToCenter, centerSvgMatrixWithoutVisibleScale);

        runInAction("updateMatrix", () => {
            // create matrices
            this.matrix = m4.ortho(0, canvasSize.width, canvasSize.height, 0, -1, 1) as Float32Array;
            m4.multiply(this.matrix, zoomMatrix, this.matrix);
            m4.multiply(this.matrix, centerSvgMatrix, this.matrix);

            this.pxSvgMatrix = m4.scale(m4.identity(), [1 / this.pixelRatio, 1 / this.pixelRatio, 1]) as Float32Array;
            this.svgPxUnzoomedMatrix = new Float32Array(this.pxSvgMatrix);
            m4.multiply(this.pxSvgMatrix, zoomMatrix, this.pxSvgMatrix);
            m4.multiply(this.pxSvgMatrix, centerSvgMatrix, this.pxSvgMatrix);
            m4.inverse(this.pxSvgMatrix, this.pxSvgMatrix);

            m4.multiply(this.svgPxUnzoomedMatrix, centerSvgMatrixWithoutVisibleScale, this.svgPxUnzoomedMatrix);

            this.ptscaleVal = 1 / svgPxScale / zoomTransform.k;
        });

        // if (this.prevPtscale !== this.ptscale) {
        //     this.firePtscaleChange();
        //     this.prevPtscale = this.ptscale;
        // }
    }
}
