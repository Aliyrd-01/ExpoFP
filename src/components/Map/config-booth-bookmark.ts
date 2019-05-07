import settings from '@/settings';
import BoothDrawerBase from "./BoothDrawerBase";
import { createBookmarkCanvas } from './canvases';
import { subscribePtscaleChange, getPtscale } from './matrix';
import { requireUpdate } from './draw';
import Drawer from './Drawer';

const bookmarkCanvasL = createBookmarkCanvas(8);
const bookmarkCanvasM = createBookmarkCanvas(5);


export default function configBoothBookmark(booth: Booth) {
    return new BoothBookmarkDrawer(booth);
}

class BoothBookmarkDrawer extends BoothDrawerBase<Drawer> {

    constructor(booth: Booth) {
        super(booth, 'booth-bookmark', Drawer);
        const r = this.booth.rect;

        this.drawer.addObject({
            id: this.getId("L"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2 + __fpBorderWidth / 2, r.w / 2 - __fpBorderWidth / 2, r.h / 4],
            deltaPts: [-1, -2, -5, 0],
            scalePts: devicePixelRatio,
            canvasTmp: bookmarkCanvasL,
            texPosition: 'righttop',
            visible: false
        });

        this.drawer.addObject({
            id: this.getId("M"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2 + __fpBorderWidth / 2, r.w / 2 - __fpBorderWidth / 2, r.h / 2],
            deltaPts: [-1, -2, -2, 0],
            scalePts: devicePixelRatio,
            canvasTmp: bookmarkCanvasM,
            texPosition: 'righttop',
            visible: false
        });

        this.drawer.addObject({
            id: this.getId("S"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            // deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            deltaPts:
                [-bookmarkCanvasM.width / 2, -bookmarkCanvasM.height / 2,
                bookmarkCanvasM.width / 2, bookmarkCanvasM.height / 2],
            canvasTmp: bookmarkCanvasM,
            texPosition: 'center',
            visible: false
        });

        subscribePtscaleChange(() => requireUpdate(this.updateBound));
    }

    update() {
        const ptscale = getPtscale();

        const bookmarked = this.booth.special === false && this.booth.exhibitors.find(e => store.state.bookmarked[e]);

        let view: string;


        if (bookmarked) {
            const widthPx = this.booth.rect.w / ptscale / devicePixelRatio;
            const heightPx = this.booth.rect.h / ptscale / devicePixelRatio;
            if (widthPx > 25 && heightPx > 25) {
                view = "L";
            } else if (widthPx > 14) {
                view = "M";
            } else {
                view = "S";
            }
        }

        const skipDimm = this.getBoothState().skipDim;
        ["L", "M", "S"].forEach(x => {
            this.drawer.updateVisible(this.getId(x), x === view);
            this.drawer.updateSkipdim(this.getId(x), skipDimm);
        });
    }
}
