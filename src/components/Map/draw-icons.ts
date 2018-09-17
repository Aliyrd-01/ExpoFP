import c from './drawing-context'
import svg, { svgHeight, svgWidth } from '@/tools/svg'
import iconsData, { IconData } from '@/tools/icons'
import { getCurrentSpriteIntersectingObjects } from './caching';
import settings from '@/settings';

const icons = (d3.select(svg).select('#Icons').selectAll('rect').nodes() as SVGRectElement[]).map(r => ({
    type: r.getAttribute("data-name") || r.getAttribute("id"),
    cx: Math.round(Rect.fromSvgRectElement(r).cx),
    cy: Math.round(Rect.fromSvgRectElement(r).cy)
}));

export default function drawIcons() {
    const ctx = c.spriteContext;

    // ctx.strokeStyle = c.dimColor(settings.colors.fg);
    // ctx.lineWidth = c.getUnscaled(c.detailLevel > 5000 ? 1.5 : 1);

    // ctx.fillStyle = c.dimColor(settings.colors.columns);
    // const size = svg.he * c.zoomScale;// / c.deviceScale;// Math.floor(c.getUnscaled(16));
    const sizeS = Math.floor(Math.sqrt(svgHeight * svgWidth) / 34);// c.getUnscaled(size);
    const size = sizeS * c.zoomScale * c.deviceScale * c.fpScale;

    const rects = icons.map(i => {
        const rect = Rect.fromCxcywh(i.cx, i.cy, sizeS, sizeS);
        return {
            type: i.type,
            rect
        };
    })
    const filtered = getCurrentSpriteIntersectingObjects(rects);
    // ctx["imageSmoothingQuality"] = "high";
    for (const col of filtered) {
        const r = col.rect;
        const iData = iconsData[col.type];
        const ca = getIconCanvas(iData, size * 2, c.dimmed);
        ctx.drawImage(ca, r.x1, r.y1, r.w, r.h)

        // ctx.beginPath();
        //ctx.fillRect(r.x1, r.y1, r.w, r.h);
        // ctx.fill();
    }
}

const canvasCache = new Map<string, HTMLCanvasElement>();

function getIconCanvas(icon: IconData, size: number, dimmed: boolean) {
    const key = icon.type + '|' + size + '|' + dimmed;
    let canvas = canvasCache.get(key);
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');
        ctx["imageSmoothingQuality"] = "high";
        // ctx.save();
        // ctx.fillStyle = "#f00";
        // ctx.fillRect(0,0, size, size);
        // ctx.restore();
        // return canvas;

        ctx.fillStyle = c.dimColor(settings.colors.icons, dimmed);
        // ctx.fillRect(0, 0, size, size);
        roundRect(ctx, 0, 0, size, size, size / 5);
        ctx.fill();

        const scale = Math.min(size / icon.width, size / icon.height) * 0.7;
        const scaledWidth = icon.width * scale;
        const scaledHeight = icon.height * scale;
        const paddingX = (size - scaledWidth) / 2;
        const paddingY = (size - scaledHeight) / 2;
        ctx.translate(paddingX, paddingY);

        ctx.scale(scale, scale);

        const pathNode = d3.select(icon.svg).select("path").node() as SVGPathElement;
        const p = new Path2D(pathNode.getAttribute("d"));
        ctx.fillStyle = c.dimColor("#fff", dimmed);
        ctx.fill(p);

        canvasCache.set(key, canvas);
    }
    return canvas;
}

function roundRect(ctx: CanvasRenderingContext2D, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}