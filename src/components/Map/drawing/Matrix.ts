import { zoomIdentity, ZoomTransform } from 'd3-zoom';
import { m4 } from 'twgl.js';
import Rect from '../../../core/Rect';
import Size from '../../../core/Size';
import { svgHeight, svgWidth } from '../../../data/svg';

export default class Matrix {
    // svg -> -1..1
    private matrix: Float32Array;
    // browser px -> svg
    private pxSvgMatrix: Float32Array;
    // canvas point -> svg scale
    private ptscale: number;
    // svg -> browser px matrix (unzoomed)
    private svgPxUnzoomedMatrix: Float32Array;

    public pixelRatio = devicePixelRatio;

    //
    // dependencies and misc
    //
    private prevPtscale: number;
    private canvasSize: Size;
    private visibleRect: Rect;
    private visibleScale: number;
    private zoomTransform: ZoomTransform;


    constructor(canvasSize: Size) {
        this.canvasSize = canvasSize;
        this.visibleRect = Rect.fromXywh(0, 0, canvasSize.width, canvasSize.height);
        this.zoomTransform = zoomIdentity;
        this.visibleScale = 1;
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
    getMatrix() { return this.matrix; }
    getPtscale() { return this.ptscale; }
    getPxSvgMatrix() { return this.pxSvgMatrix; }
    getSvgPxUnzoomedMatrix() { return this.svgPxUnzoomedMatrix; }
    getZoomTransform() { return this.zoomTransform; }
    getVisibleRect() { return this.visibleRect; }
    getVisibleScale() { return this.visibleScale; }

    //
    // subscribe
    //
    private ptscaleChangeSubscribers: ((ptscale: number) => void)[] = [];
    subscribePtscaleChange(cb: (ptscale) => void) { this.ptscaleChangeSubscribers.push(cb); }
    private firePtscaleChange() { this.ptscaleChangeSubscribers.forEach(x => x(this.ptscale)); }

    private matrixChangeSubscribers: ((matrix: Float32Array) => void)[] = [];
    subscribeMatrixChange(cb: (ptscale: Float32Array) => void) { this.matrixChangeSubscribers.push(cb); }
    private fireMatrixChange() { this.matrixChangeSubscribers.forEach(x => x(this.matrix)); }

    //
    // core
    //
    private calcAll() {
        // dirty = false;
        const { zoomTransform, visibleRect, visibleScale, canvasSize } = this;

        //const visibleRectPt = visibleRect.scale(this.pixelRatio);
        const svgPxScaleUnzoomed = Math.min(visibleRect.w / svgWidth, visibleRect.h / svgHeight);
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
        const moveToCenter = [-svgWidth / 2, -svgHeight / 2, 0];
        m4.translate(centerSvgMatrix, moveToCenter, centerSvgMatrix);
        m4.translate(centerSvgMatrixWithoutVisibleScale, moveToCenter, centerSvgMatrixWithoutVisibleScale);

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

        this.ptscale = 1 / svgPxScale / zoomTransform.k;

        this.fireMatrixChange();
        if (this.prevPtscale !== this.ptscale) {
            this.firePtscaleChange();
            this.prevPtscale = this.ptscale;
        }
    }
}