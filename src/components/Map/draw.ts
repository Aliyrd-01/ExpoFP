import { svgWidth, svgHeight } from '@/tools/svg'
import { getFpDestinationRectangle } from './utils';
import c from './drawing-context'
import { drawFpGrid, drawDebug } from './draw-debug';
import settings from '@/settings';
import { drawSprites } from './draw-sprites';
export { getBoothIdFromClientXy } from './booth-by-xy';

export function initialize(rootCanvasParam: HTMLCanvasElement, visibleRect: Rect) {

    c.canvas = rootCanvasParam;
    c.visibleBRect = visibleRect;
    c.context = c.canvas.getContext('2d');
    c.context.imageSmoothingEnabled = false;
    c.svgWidth = svgWidth;
    c.svgHeight = svgHeight;
    c.zoomBx = 0;
    c.zoomBy = 0;
    c.zoomScale = 1;

    c.requireRedraw = requireRedraw;
    const booths = store.getters.boothsArray as Booth[]
    const areas = booths.map(x => x.rect.getArea());

    c.fpAvgBoothArea = areas.reduce((p, c) => p + c, 0) / areas.length;

    draw();
}

let animatedFrame: number;
export function requireRedraw() {
    if (animatedFrame) window.cancelAnimationFrame(animatedFrame);
    animatedFrame = window.requestAnimationFrame(draw);
}

export function applyZoomTransform(transform: { k: number, x: number, y: number }) {
    // console.log('applyZoomTransform', transform.k, transform.x, transform.y)
    c.zoomScale = Math.round(transform.k * 10000) / 10000;
    c.zoomBx = transform.x;
    c.zoomBy = transform.y;
    requireRedraw();
}

export function setVisibleRect(rect: Rect) {
    c.visibleBRect = rect;
    requireRedraw();
}

// let prevCacheId: string;
function draw() {
    if (!c.canvas) return;
    sizeCanvases();

    // console.log('draw', c.zoomBx, c.zoomBy);
    const ctx = c.context;

    const fpRect = getFpDestinationRectangle(c.svgWidth, c.svgHeight, c.bWidth, c.bHeight, c.visibleBRect);

    c.fpCxUnzoomed = fpRect.x;
    c.fpCyUnzoomed = fpRect.y;
    c.fpCWidthUnzoomed = fpRect.width;
    c.fpCHeightUnzoomed = fpRect.height;

    c.fpScale = fpRect.scale;

    ctx.save();

    ctx.fillStyle = c.dimColor(settings.colors.base);
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // ctx.fillStyle = '#ff0000';
    // ctx.fillRect(c.fpCxUnzoomed, c.fpCyUnzoomed, c.fpCWidthUnzoomed, c.fpCHeightUnzoomed);

    // ctx.fillStyle = '#ffff00';
    // ctx.fillRect(c.fpCx, c.fpCy, c.fpCWidth, c.fpCHeight);

    drawSprites();

    ctx.restore();

    // ctx.save();

    // ctx.fillStyle = '#ff0000';
    // ctx.beginPath();
    // const cx = 100;
    // const cy = 100;

    // ctx.arc(c.getCanvasXFromSvg(cx), c.getCanvasYFromSvg(cy), 40, 0, 2 * Math.PI);
    // ctx.fill();

    // ctx.restore();

    if (settings.debug) drawDebug();
}

function sizeCanvases() {
    c.bWidth = c.canvas.parentElement.clientWidth;
    c.bHeight = c.canvas.parentElement.clientHeight;

    if (c.canvas.clientWidth !== c.bWidth || c.canvas.clientHeight !== c.bHeight) {
        console.log('Setting canvas style width/height');

        c.canvas.style.width = c.bWidth + 'px';
        c.canvas.style.height = c.bHeight + 'px';
    }

    if (c.cWidth !== c.canvas.width || c.cHeight !== c.canvas.height) {
        c.canvas.width = c.cWidth;
        c.canvas.height = c.cHeight;
    }
}

