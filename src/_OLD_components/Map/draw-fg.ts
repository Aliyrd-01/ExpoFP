import c from './drawing-context'
import svg from '@/tools/svg'
import { getCurrentSpriteIntersectingObjects } from './caching';
import settings from '@/settings';

//const fgRects = (d3.select(svg).select('#FG').selectAll('rect').nodes() as SVGRectElement[]).map(r => Rect.fromSvgRectElement(r));
const wallLines = (d3.select(svg).select('#Walls').selectAll('line').nodes() as SVGLineElement[]).map(r => Line.fromSvgLineElement(r));

export default function drawFg() {//visibleOnly:boolean = false
    // console.log('drawFg');
    // const { ctx } = c;
    // ctx.fillStyle = "#ccc";
    // // this doesn't work as expected!!
    // const fgRectsFiltered = visibleOnly ? fgRects.filter(b => b.intersects(c.svgViewBox)) : fgRects;
    // for (var r of fgRectsFiltered) {
    //     ctx.fillRect(r.x1, r.y1, r.w, r.h);
    // }

    const ctx = c.spriteContext;


    ctx.strokeStyle = c.dimColor(settings.colors.fg);
    ctx.lineWidth = c.getStrokeWidth();
    const wallLinesFiltered = getCurrentSpriteIntersectingObjects(wallLines);// wallLines.filter(b => b.intersects(c.svgViewBox)) : wallLines;
    for (const line of wallLinesFiltered) {
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();
    }
}