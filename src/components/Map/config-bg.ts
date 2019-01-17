import Color from 'color';
import { requireDrawer, requireUpdate } from "./draw";
import TriangleDrawer, { TriangleDrawerObject } from "./TriangleDrawer";
import settings from '@/settings';
import svg from '@/tools/svg'

export default function configBg() {
    const drawer = requireDrawer('bg', TriangleDrawer);

    const rects = (d3.select(svg).select('#BG').selectAll('rect').nodes() as SVGRectElement[])
        .map(r => Rect.fromSvgRectElement(r)) as Rect[];

    const color = ColorInfo.fromHex(settings.colors.bg).toVec4();

    for (const r of rects) {
        drawer.addObject({
            p0: [r.x1, r.y1],
            p1: [r.x2, r.y1],
            p2: [r.x1, r.y2],
            color
        });
        drawer.addObject({
            p1: [r.x2, r.y1],
            p2: [r.x1, r.y2],
            p0: [r.x2, r.y2],
            color
        });
    }
};




