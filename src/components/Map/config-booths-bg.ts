import Color from 'color';
import settings from '@/settings';
import { BoothDrawerBase } from './config-booths-base';
import { getBoothState } from './config-booths';


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
        const c = getBoothColor(this.booth);
        this.drawer.updateColor(this.getId('bg'), c);
        this.drawer.updateSkipdim(this.getId('bg'), s.skipDim);
    }
}


function getBoothColor(b: Booth): Vec4 {
    const s = getBoothState(b);
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

    return colorInfo.vec4();
}



