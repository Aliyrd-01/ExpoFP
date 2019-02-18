import { BoothDrawerBase } from './config-booths-base';
import Color from 'color';

export default class BoothBorderDrawer extends BoothDrawerBase {
    constructor(booth: Booth) {
        super(booth, 'booth-border');

        const borderColor = Color("#fff").vec4();
        const r = this.booth.rect;
        const width = 0.9;

        this.drawer.addObject({
            id: this.getId("_1"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, r.w / 2, -r.h / 2],
            deltaPts: [-width, -width, width, width],
            scalePts: devicePixelRatio,
            color: borderColor
        });
        this.drawer.addObject({
            id: this.getId("_2"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, -r.w / 2, r.h / 2],
            scalePts: devicePixelRatio,
            deltaPts: [-width, -width, width, width],
            color: borderColor
        });
        this.drawer.addObject({
            id: this.getId("_3"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, r.h / 2, r.w / 2, r.h / 2],
            scalePts: devicePixelRatio,
            deltaPts: [-width, -width, width, width],
            color: borderColor
        });
        this.drawer.addObject({
            id: this.getId("_4"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            deltas: [r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            scalePts: devicePixelRatio,
            deltaPts: [-width, -width, width, width],
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



