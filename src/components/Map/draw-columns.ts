import c from './drawing-context'
import svg from '@/tools/svg'
import { getSpriteIntersectingObjects } from './caching';
import settings from '@/settings';

const columns = (d3.select(svg).select('#Columns').selectAll('circle').nodes() as SVGCircleElement[]).map(r => Circle.fromSvgCircleElement(r));

export default function drawColumns() {
    const ctx = c.spriteContext;

    ctx.fillStyle = c.dimColor(settings.colors.columns);
    const filtered = getSpriteIntersectingObjects(columns);
    for (const col of filtered) {
        ctx.beginPath();
        ctx.arc(col.cx, col.cy, col.r, 0, 2 * Math.PI);
        ctx.fill();
    }
}