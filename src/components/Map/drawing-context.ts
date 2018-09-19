import Color from 'color';
import settings from '@/settings';

// b - browser pixes coordinates
// c - canvas coordincates (b * bScale)
// z - zoom coordinates (same as canvas, but )
// f - fp coordinates
// s - svg coordinates (scale from fp/canvas)
class DrawingContext {
    bWidth: number;
    bHeight: number;
    visibleBRect: Rect;

    deviceScale = window.devicePixelRatio;
    get cWidth() { return Math.ceil(this.bWidth * this.deviceScale); }
    get cHeight() { return Math.ceil(this.bHeight * this.deviceScale); }

    zoomScale: number;
    zoomBx: number;
    zoomBy: number;

    fpCxUnzoomed: number;
    fpCyUnzoomed: number;
    fpCWidthUnzoomed: number;
    fpCHeightUnzoomed: number;
    fpScale: number;

    svgWidth: number;
    svgHeight: number;

    // cummulative scale SVG to canvas
    get svgScale() { return this.deviceScale * this.zoomScale * this.fpScale; }
    getUnscaled(size: number) { return size / this.zoomScale / this.fpScale; }
    getStrokeWidth() { return this.getUnscaled(this.detailLevel > 8000 ? 2 : (this.detailLevel > 4000 ? 1.5 : 1.25)) }

    get fpCx() { return Math.floor(this.deviceScale * (this.zoomBx + this.zoomScale * this.fpCxUnzoomed)); }
    get fpCy() { return Math.floor(this.deviceScale * (this.zoomBy + this.zoomScale * this.fpCyUnzoomed)); }
    get fpCWidth() { return Math.floor(this.deviceScale * this.zoomScale * this.fpCWidthUnzoomed); }
    get fpCHeight() { return Math.floor(this.deviceScale * this.zoomScale * this.fpCHeightUnzoomed); }

    get fpCRect() { return Rect.fromXywh(this.fpCx, this.fpCy, this.fpCWidth, this.fpCHeight); }
    get fpCRectVisible() { return Rect.fromXywh(0, 0, this.cWidth, this.cHeight).getIntersection(this.fpCRect) };
    get fpFRectVisible() { return this.fpCRectVisible.clone().translate(-this.fpCx, -this.fpCy); };

    get dimmed() { return !!store.getters.highlightedBoothIds; }
    dimColor(color: string, dimIfOnly: boolean = undefined): string {
        if (dimIfOnly === undefined) dimIfOnly = this.dimmed;
        if (dimIfOnly) return Color(color).mix(Color(settings.colors.base), settings.colors.dim).toString();
        return color;
    }

    //
    requireRedraw: () => void;

    // 
    // hoverCanvas: HTMLCanvasElement;
    // hoverContext: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    // hover: boolean;

    //
    spriteContext: CanvasRenderingContext2D;
    spriteSRect: Rect;
    spriteScaleX: number;
    spriteScaleY: number;

    sXToSprite(x: number): number { return this.spriteScaleX * (x - this.spriteSRect.x1); }
    sYToSprite(y: number): number { return this.spriteScaleY * (y - this.spriteSRect.y1); }
    sWToSprite(w: number): number { return this.spriteScaleX * w; }
    sHToSprite(h: number): number { return this.spriteScaleY * h; }
    sRectToSprite(rect: Rect): Rect {
        return Rect.fromXywh(this.sXToSprite(rect.x1), this.sYToSprite(rect.y1), this.sWToSprite(rect.w), this.sHToSprite(rect.h));
    }

    // sprite

    //
    // get canvas() { return this.hover ? this.hoverCanvas : this.visibleCanvas; }
    // get context() { return this.hover ? this.hoverContext : this.visibleContext; }



    // detail level
    fpAvgBoothArea: number;
    get detailLevel() { return this.fpAvgBoothArea * this.fpScale * this.zoomScale * this.fpScale * this.zoomScale; }
}


const ctx = new DrawingContext();
(window as any)['renderContext'] = ctx;
export default ctx;

