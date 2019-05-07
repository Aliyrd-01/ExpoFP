import BoothDrawerBase from "./BoothDrawerBase";
import { createBookmarkCanvas, createCircleCanvas } from './canvases';
import { subscribePtscaleChange, getPtscale } from './matrix';
import { requireUpdate } from './draw';
import Drawer from './Drawer';
import { getBoothState } from "./config-booths";

// const bookmarkCanvasL = createBookmarkCanvas(8);
// const bookmarkCanvasM = createBookmarkCanvas(5);


const canvasCache = new Map<string, ReturnType<typeof createCircleCanvas>>();

function requireCanvas(radius, color) {
    const key = `${radius}${color}`;
    let cached = canvasCache.get(key);
    if (!cached) {
        cached = createCircleCanvas(radius, color);
        canvasCache.set(key, cached);
    }

    return cached;
}

export default function configBoothBookmark(booth: Booth) {
    if (booth.special !== false) return;
    if (!booth.typeColor) return;
    const s = getBoothState(booth);
    if (!s.empty || s.onhold) return;
    return new BoothTypeDrawer(booth);
}

class BoothTypeDrawer extends BoothDrawerBase<Drawer> {
    constructor(booth: RegularBooth) {
        super(booth, 'booth-type', Drawer, 120);
        const r = this.booth.rect.withPadding(__fpBorderWidth / 2);

        const canvL = requireCanvas(12, booth.typeColor);
        const canvM = requireCanvas(6, booth.typeColor);
        const canvS = requireCanvas(4, booth.typeColor);
        const canvXS = requireCanvas(8, booth.typeColor);

        this.drawer.addObject({
            id: this.getId("L"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            deltaPts: [0, 3, -3, 0],
            scalePts: devicePixelRatio,
            canvasTmp: canvL.canvas,
            texPosition: 'righttop',
            visible: false
        });

        this.drawer.addObject({
            id: this.getId("M"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            deltaPts: [0, 1, -1, 0],
            scalePts: devicePixelRatio,
            canvasTmp: canvM.canvas,
            texPosition: 'righttop',
            visible: false
        });

        this.drawer.addObject({
            id: this.getId("S"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            deltaPts: [0, 1, -1, 0],
            scalePts: devicePixelRatio,
            canvasTmp: canvS.canvas,
            texPosition: 'righttop',
            visible: false
        });


        this.drawer.addObject({
            id: this.getId("XS"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            deltaPts: [0, 0, 0, 0],
            scalePts: devicePixelRatio,
            canvasTmp: canvXS.canvas,
            texPosition: 'righttop',
            visible: false
        });

        // this.drawer.addObject({
        //     id: this.getId("XS"),
        //     rotateRadians: booth.rotate,
        //     center: [r.cx, r.cy],
        //     // deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
        //     deltaPts: [-canvXS.canvas.width / 2, -canvXS.canvas.height / 2, canvXS.canvas.width / 2, canvXS.canvas.height / 2],
        //     canvasTmp: canvXS.canvas,
        //     texPosition: 'center',
        //     visible: false
        // });

        subscribePtscaleChange(() => requireUpdate(this.updateBound));
    }

    update() {
        const ptscale = getPtscale();
        let view: string;

        const widthPx = this.booth.rect.w / ptscale / devicePixelRatio;
        const heightPx = this.booth.rect.h / ptscale / devicePixelRatio;
        if (widthPx > 75 && heightPx > 75) {
            view = "L";
        } else if (widthPx > 25) {
            view = "M";
        } else if (widthPx > 12) {
            view = "S";
        }
        else {
            view = "XS";
        }

        const skipDimm = this.getBoothState().skipDim;
        ["L", "M", "S", "XS"].forEach(x => {
            this.drawer.updateVisible(this.getId(x), x === view);
            this.drawer.updateSkipdim(this.getId(x), skipDimm);
        });
    }
}
