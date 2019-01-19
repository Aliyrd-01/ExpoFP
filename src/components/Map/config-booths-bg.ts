import Color from 'color';
import settings from '@/settings';
import { BoothDrawerBase } from './config-booths-base';


export default class BoothBgDrawer extends BoothDrawerBase {
    constructor(booth: Booth) {
        super(booth, 'booth-bg');

        const r = this.booth.rect;
        this.drawer.addObject({
            id: this.getId('bg'),
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            deltaPts: [.5, .5, -.5, -.5]
        });
        this.update();
    }

    update() {
        const s = getBoothState(this.booth);
        const c = getBoothColor(s, this.booth);
        this.drawer.updateColor(this.getId('bg'), c);
        this.drawer.updateSkipdim(this.getId('bg'), s.skipDim);
    }
}

function getBoothState(b: Booth) {
    const g = store.getters;

    const hover = g.hoveredBoothIds.indexOf(b.id) !== -1;
    const selected = !!g.selectedBoothIdsSet.has(b.id);
    const inList = g.listBoothsIdsSet.has(b.id);
    const dimmedFp = g.dimmed;
    // const dimmed = dimmedFp && !inList && !selected;
    const skipDim = inList || selected;

    const empty = b.exhibitors.length === 0;
    const error = !!b.error;
    const bookmarked = b.exhibitors.find(e => store.state.bookmarked[e])
    return { hover, selected, skipDim, error, empty, bookmarked };
}

function getBoothColor(s: ReturnType<typeof getBoothState>, b: Booth): Vec4 {
    let color: string;
    const defColor = s.empty ? (b.availableColor || settings.colors.booths.empty) : 
        (b.soldColor || settings.colors.booths.default);

    if (s.error) color = '#f33'
    else if (s.selected) color = settings.colors.booths.selected;
    else color = defColor;

    // if (s.dimmed && !s.selected) {
    //     color = settings.colors.booths.empty; ;
    // }

    let colorInfo = Color(color);
    if (s.hover && !s.selected) {
        colorInfo = colorInfo.darken(0.2);
    }

    // color = c.dimColor(color, s.dimmed && !s.selected);

    // if (s.selected) color = Color(__settings.colors.booths.selected);
    // else color = Color(__settings.colors.booths.default);

    // if (s.hover) {
    //     color = color.darken(0.2);
    // }

    return colorInfo.vec4();
}



