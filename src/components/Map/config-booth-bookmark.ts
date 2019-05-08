import settings from '@/settings';
import BoothDrawerBase from "./BoothDrawerBase";
import { createBookmarkCanvas } from './canvases';
import { subscribePtscaleChange, getPtscale } from './matrix';
import { requireUpdate } from './draw';
import Drawer from './Drawer';

const bookmarkCanvasXL = createBookmarkCanvas(11);
const bookmarkCanvasL = createBookmarkCanvas(8);
const bookmarkCanvasM = createBookmarkCanvas(6);


export default function configBoothBookmark(booth: Booth) {
    return new BoothBookmarkDrawer(booth);
}

class BoothBookmarkDrawer extends BoothDrawerBase<Drawer> {

    constructor(booth: Booth) {
        super(booth, 'booth-bookmark', Drawer, 140);
        const r = this.booth.rect.withPadding(settings.borderWidth / 2);

        this.drawer.addObject({
            id: this.getId("XL"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            deltaPts: [0, -bookmarkCanvasXL.lineWidth - bookmarkCanvasXL.padding, -bookmarkCanvasXL.lineWidth - bookmarkCanvasXL.padding, 0],
            canvasTmp: bookmarkCanvasXL.canvas,
            texPosition: 'righttop',
            visible: false
        });

        this.drawer.addObject({
            id: this.getId("L"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            deltaPts: [0, -bookmarkCanvasL.lineWidth - bookmarkCanvasL.padding, -bookmarkCanvasL.lineWidth - bookmarkCanvasL.padding, 0],
            canvasTmp: bookmarkCanvasL.canvas,
            texPosition: 'righttop',
            visible: false
        });

        this.drawer.addObject({
            id: this.getId("M"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            deltaPts: [0, -bookmarkCanvasL.lineWidth - bookmarkCanvasL.padding, -bookmarkCanvasL.lineWidth - bookmarkCanvasL.padding, 0],
            canvasTmp: bookmarkCanvasM.canvas,
            texPosition: 'righttop',
            visible: false
        });

        this.drawer.addObject({
            id: this.getId("S"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            // deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            deltaPts:
                [-bookmarkCanvasM.canvas.width / 2, -bookmarkCanvasM.canvas.height / 2,
                bookmarkCanvasM.canvas.width / 2, bookmarkCanvasM.canvas.height / 2],
            canvasTmp: bookmarkCanvasM.canvas,
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
            if (widthPx > 50 && heightPx > 50) {
                view = "XL";
            } else if (widthPx > 25 && heightPx > 25) {
                view = "L";
            } else if (widthPx > 14) {
                view = "M";
            } else {
                view = "S";
            }
        }

        const skipDimm = this.getBoothState().skipDim;
        ["XL", "L", "M", "S"].forEach(x => {
            this.drawer.updateVisible(this.getId(x), x === view);
            this.drawer.updateSkipdim(this.getId(x), skipDimm);
        });
    }
}
