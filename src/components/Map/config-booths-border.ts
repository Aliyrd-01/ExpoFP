import { BoothDrawerBase } from './config-booths-base';

export default class BoothBorderDrawer extends BoothDrawerBase {
    constructor(booth: Booth) {
        super(booth, 'booth-border');
        const borderColor = [1, 1, 1, 1] as Vec4;
        const r = this.booth.rect;
        this.drawer.addObject({
            id: this.getId("_1"),
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, r.w / 2, -r.h / 2],
            deltaPts: [-.5, -.5, .5, .5],
            scalePts: devicePixelRatio,
            color: borderColor
        });
        this.drawer.addObject({
            id: this.getId("_2"),
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, -r.w / 2, r.h / 2],
            scalePts: devicePixelRatio,
            deltaPts: [-.5, -.5, .5, .5],
            color: borderColor
        });
        this.drawer.addObject({
            id: this.getId("_3"),
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, r.h / 2, r.w / 2, r.h / 2],
            scalePts: devicePixelRatio,
            deltaPts: [-.5, -.5, .5, .5],
            color: borderColor
        });
        this.drawer.addObject({
            id: this.getId("_4"),
            center: [r.cx, r.cy],
            deltas: [r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            scalePts: devicePixelRatio,
            deltaPts: [-.5, -.5, .5, .5],
            color: borderColor
        });

        this.update();
    }

    update() {
        const skipDimm = this.getBoothState().skipDim;
        this.drawer.updateSkipdim(this.getId('_1'), skipDimm);
        this.drawer.updateSkipdim(this.getId('_2'), skipDimm);
        this.drawer.updateSkipdim(this.getId('_3'), skipDimm);
        this.drawer.updateSkipdim(this.getId('_4'), skipDimm);
    }
}



