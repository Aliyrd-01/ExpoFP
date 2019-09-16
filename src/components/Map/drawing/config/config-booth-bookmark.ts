import { reaction } from "mobx";
import { boothStore } from "../../../../store";
import { Booth, RegularBooth } from "../../../../store/BoothStore";
import { DrawerContext } from "../Drawer1";
import RectPainter from "../painters/RectPainter";
import BoothDrawerBase from "./BoothDrawerBase";
import { createBookmarkCanvas } from "./canvases";

export default function configBoothBookmark(context: DrawerContext, booth: Booth) {
    if (!(booth instanceof RegularBooth)) return;
    new BoothBookmarkDrawer(context, booth);
}

class BoothBookmarkDrawer extends BoothDrawerBase<RectPainter> {
    constructor(context: DrawerContext, booth: RegularBooth) {
        super(context, booth, "booth-bookmark", RectPainter, 140);
        const r = this.booth.rect.withPadding(boothStore.borderWidth / 2);

        const bookmarkCanvasXL = createBookmarkCanvas(11, context.pixelRatio);
        const bookmarkCanvasL = createBookmarkCanvas(8, context.pixelRatio);
        const bookmarkCanvasM = createBookmarkCanvas(6, context.pixelRatio);

        this.painter.addObject({
            id: this.getId("XL"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            deltaPts: [
                0,
                -bookmarkCanvasXL.lineWidth - bookmarkCanvasXL.padding,
                -bookmarkCanvasXL.lineWidth - bookmarkCanvasXL.padding,
                0
            ],
            canvasTmp: bookmarkCanvasXL,
            texPosition: "righttop",
            visible: false
        });

        this.painter.addObject({
            id: this.getId("L"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            deltaPts: [
                0,
                -bookmarkCanvasL.lineWidth - bookmarkCanvasL.padding,
                -bookmarkCanvasL.lineWidth - bookmarkCanvasL.padding,
                0
            ],
            canvasTmp: bookmarkCanvasL,
            texPosition: "righttop",
            visible: false
        });

        this.painter.addObject({
            id: this.getId("M"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            deltaPts: [
                0,
                -bookmarkCanvasL.lineWidth - bookmarkCanvasL.padding,
                -bookmarkCanvasL.lineWidth - bookmarkCanvasL.padding,
                0
            ],
            canvasTmp: bookmarkCanvasM,
            texPosition: "righttop",
            visible: false
        });

        this.painter.addObject({
            id: this.getId("S"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            // deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            deltaPts: [
                -bookmarkCanvasM.width / 2,
                -bookmarkCanvasM.height / 2,
                bookmarkCanvasM.width / 2,
                bookmarkCanvasM.height / 2
            ],
            canvasTmp: bookmarkCanvasM,
            texPosition: "center",
            visible: false
        });

        if (context.updatable) {
            context.subscribePtscaleChange(() => context.requireUpdate(this.updateBound));
            reaction(() => [booth.skipDim, booth.bookmarked], () => context.requireUpdate(this.updateBound));
        }
    }

    private prevVisible:boolean = false;

    update() {
        const { bookmarked, skipDim } = this.booth as RegularBooth;
        if (!bookmarked && !this.prevVisible) return;
        this.prevVisible = bookmarked;

        const ptscale = this.context.getPtscale();
        // __logger.log('bookmark update', bookmarked, skipDim);

        let view: string;

        if (bookmarked) {
            const widthPx = this.booth.rect.w / ptscale / this.context.pixelRatio;
            const heightPx = this.booth.rect.h / ptscale / this.context.pixelRatio;
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

        ["XL", "L", "M", "S"].forEach(x => {
            this.painter.updateVisible(this.getId(x), x === view);
            this.painter.updateSkipdim(this.getId(x), skipDim);
        });
    }
}
