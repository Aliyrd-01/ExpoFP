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
            deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 4],
            deltaPts: [-1, -3, -5, 0],
            canvasTmp: bookmarkCanvasL,
            texPosition: 'righttop',
            visible: true
        });

        this.drawer.addObject({
            id: this.getId("M"),
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            deltaPts: [-1, -2, -2, 0],
            canvasTmp: bookmarkCanvasM,
            texPosition: 'righttop',
            visible: false
        });

        this.drawer.addObject({
            id: this.getId("S"),
            center: [r.cx, r.cy],
            // deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            deltaPts:
                [-bookmarkCanvasS.width / 2, -bookmarkCanvasS.height / 2,
                bookmarkCanvasS.width / 2, bookmarkCanvasS.height / 2],
            canvasTmp: bookmarkCanvasS,
            texPosition: 'center',
            visible: false
        });

        subscribePtscaleChange(() => requireUpdate(this.updateBound));
    }

    update() {
        const { ptscale } = getCurrentMatrixAndScale();

        const bookmarked = this.booth.exhibitors.find(e => store.state.bookmarked[e]);

        let viewL = false;
        let viewM = false;
        let viewS = false;

        if (bookmarked) {
            const widthPx = this.booth.rect.w / ptscale / devicePixelRatio;
            const heightPx = this.booth.rect.h / ptscale / devicePixelRatio;
            viewL = widthPx > 25 && heightPx > 25;
            viewM = !viewL && widthPx > 10;
            viewS = !viewL && !viewM;
        }

        this.drawer.updateVisible(this.getId("L"), viewL);
        this.drawer.updateVisible(this.getId("M"), viewM);
        this.drawer.updateVisible(this.getId("S"), viewS);
    }
}
