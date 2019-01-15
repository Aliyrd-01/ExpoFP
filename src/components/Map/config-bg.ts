import Color from 'color';
import { requireDrawer, requireUpdate } from "./draw";
import Drawer, { DrawerObject } from "./Drawer";
import settings from '@/settings';
import svg from '@/tools/svg'

export default function configBg() {
    const drawer = requireDrawer('bg');

    const rects = (d3.select(svg).select('#BG').selectAll('rect').nodes() as SVGRectElement[])
        .map(r => Rect.fromSvgRectElement(r));

    const color = ColorInfo.fromHex(settings.colors.bg).toVec4();

    for (const r of rects) {
        drawer.addObject({
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            color
        } as DrawerObject)
    }
};

abstract class BoothDrawerBase {
    protected readonly booth: Booth;
    protected readonly drawer: Drawer;

    constructor(booth: Booth, drawerType: string) {
        this.booth = booth;
        this.drawer = requireDrawer(drawerType);
    }

    protected getId(name: string) {
        return `b${this.booth.id}${name}`;
    }
}

class BoothBgDrawer extends BoothDrawerBase {
    constructor(booth: Booth) {
        super(booth, 'booth-bg');

        const r = this.booth.rect;
        this.drawer.addObject({
            id: this.getId('bg'),
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            deltaPts: [.5, .5, -.5, -.5],
            color: getBoothColor(this.booth)
        });
    }

    private update() {

    }

}


function getBoothState(b: Booth) {
    const g = store.getters;

    const hover = g.hoveredBoothIds.indexOf(b.id) !== -1;
    const selected = !!g.selectedBoothIdsSet.has(b.id);
    const inList = g.listBoothsIdsSet.has(b.id);
    const dimmedFp = g.dimmed;
    const dimmed = dimmedFp && !inList && !selected;

    const empty = b.exhibitors.length === 0;
    const error = !!b.error;
    const bookmarked = b.exhibitors.find(e => store.state.bookmarked[e])
    return { hover, selected, dimmed, dimmedFp, error, empty, bookmarked };
}


function getBoothColor(b: Booth): Vec4 {
    const s = getBoothState(b);
    let color: Color;

    if (s.selected) color = Color(__settings.colors.booths.selected);
    else color = Color(__settings.colors.booths.default);

    if (s.hover) {
        color = color.darken(0.2);
    }

    return ColorInfo.fromHex(color.hex()).toVec4();
}



