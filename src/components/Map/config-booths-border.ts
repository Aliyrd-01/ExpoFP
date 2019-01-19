import { BoothDrawerBase } from './config-booths-base';

export default class BoothBorderDrawer extends BoothDrawerBase {
    constructor(booth: Booth) {
        super(booth, 'booth-border');
        const borderColor = [1, 1, 1, 1] as Vec4;
        const r = this.booth.rect;
        this.drawer.addObject({
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, r.w / 2, -r.h / 2],
            deltaPts: [-.5, -.5, .5, .5],
            scalePts: devicePixelRatio,
            color: borderColor
        });
        this.drawer.addObject({
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, -r.w / 2, r.h / 2],
            scalePts: devicePixelRatio,
            deltaPts: [-.5, -.5, .5, .5],
            color: borderColor
        });
        this.drawer.addObject({
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, r.h / 2, r.w / 2, r.h / 2],
            scalePts: devicePixelRatio,
            deltaPts: [-.5, -.5, .5, .5],
            color: borderColor
        });
        this.drawer.addObject({
            center: [r.cx, r.cy],
            deltas: [r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            scalePts: devicePixelRatio,
            deltaPts: [-.5, -.5, .5, .5],
            color: borderColor
        });
    }

    update() {
        
    }
}



