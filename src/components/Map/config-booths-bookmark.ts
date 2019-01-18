import Color from 'color';
import settings from '@/settings';
import { BoothDrawerBase } from './config-booths-base';
import { createBookmarkCanvas } from './canvases';
import { getCurrentMatrixAndScale, subscribePtscaleChange } from './config-matrix';

const bookmarkCanvas = createBookmarkCanvas(10);

export default class BoothBookmarkDrawer extends BoothDrawerBase {

    constructor(booth: Booth) {
        super(booth, 'booth-bookmark');

        const r = this.booth.rect;

        this.drawer.addObject({
            id: this.getId("bookmark"),
            center: [r.cx, r.cy],
            deltas: [-r.w/2, -r.h/2, r.w/2, r.h/2],
            deltaPts: [-1, -1, -5, 0],
            canvasTmp: bookmarkCanvas,
            texPosition: 'righttop',
        });
    }


}
