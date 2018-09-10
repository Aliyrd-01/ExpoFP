import c from './drawing-context'
import svg from '@/tools/svg'
import { getSpriteIntersectingObjects } from './caching';
import settings from '@/settings';

const bgRects = (d3.select(svg).select('#BG').selectAll('rect').nodes() as SVGRectElement[]).map(r => Rect.fromSvgRectElement(r));

export default function drawBg() {
    c.spriteContext.fillStyle = c.dimColor(settings.colors.bg);;
    for (const r of getSpriteIntersectingObjects(bgRects)) {
        c.spriteContext.fillRect(r.x1, r.y1, r.w, r.h);
    }
}