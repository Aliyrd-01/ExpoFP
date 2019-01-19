import settings from '@/settings';
import { BoothDrawerBase } from './config-booths-base';
import { createBookmarkCanvas } from './canvases';
import { getCurrentMatrixAndScale, subscribePtscaleChange } from './config-matrix';
import { requireUpdate } from './draw';

const bookmarkCanvasL = createBookmarkCanvas(8);
const bookmarkCanvasM = createBookmarkCanvas(5);
const bookmarkCanvasS = createBookmarkCanvas(5);

export default class BoothBookmarkDrawer extends BoothDrawerBase {

    constructor(booth: Booth) {
        super(booth, 'booth-bookmark');
        const r = this.booth.rect;

        this.drawer.addObject({
            id: this.getId("L"),
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            deltaPts: [-1, -1, -5, 0],
            canvasTmp: bookmarkCanvasL,
            texPosition: 'righttop',
            visible: true
        });

        this.drawer.addObject({
            id: this.getId("M"),
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            deltaPts: [-1, -1, -5, 0],
            canvasTmp: bookmarkCanvasM,
            texPosition: 'righttop',
            visible: false
        });

        // this.drawer.addObject({
        //     id: this.getId("S"),
        //     center: [r.cx, r.cy],
        //     deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
        //     deltaPts: [-1, -1, -5, 0],
        //     canvasTmp: bookmarkCanvasS,
        //     texPosition: 'center',
        //     visible: false
        // });


        const updateVisibleBound = this.updateVisible.bind(this);
        subscribePtscaleChange(() => requireUpdate(updateVisibleBound));
    }

    updateVisible() {
        const { ptscale } = getCurrentMatrixAndScale();
        const widthPx = this.booth.rect.w / ptscale;

        const viewLarge = widthPx > 25 * devicePixelRatio;
        this.drawer.updateVisible(this.getId("L"), viewLarge);
        this.drawer.updateVisible(this.getId("M"), !viewLarge);
    }
}
