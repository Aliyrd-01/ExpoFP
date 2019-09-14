import { RegularBooth, Booth } from "../../../../store/BoothStore";
import settings from "../../../../tools/settings";
import { DrawerContext } from "../Drawer1";
import RectPainter from "../painters/RectPainter";
import BoothDrawerBase from "./BoothDrawerBase";
import { createCircleCanvas, createDetailsCanvas, createLabelCanvas } from "./canvases";
import { reaction } from "mobx";

// const dotCanvas = createCircleCanvas(1.5, "#fff");
// const dotW = dotCanvas.canvas.width / 2;
// const dotH = dotCanvas.canvas.width / 2;

const prefixes = ["Dot", "XS", "S", "M", "L", "Details"] as const;

// const updates = [];
// let drawer: Painter;
// function initPainter(drawer1: Painter) {
//     if (drawer) return;
//     drawer = drawer1;
//     drawer.alpha = 0;

//     window.setTimeout(() => {
//         canUpdate = true;
//         drawer.alpha = 1;
//         updates.forEach(u => u());
//         animate(0, 300, d3.easeLinear, d3.interpolateNumber(0, 1), v => (drawer.alpha = v));
//     }, delayAnimations + 800);
// }

export default function configBoothLabels(context: DrawerContext, booth: Booth) {
    if (!(booth instanceof RegularBooth) || booth.noLabels) return;
    return new BoothLabelDrawer(context, booth);
}

// function replaceColorTmp(color: string) {
//     switch (color) {
//         case "#ffcd31":
//             return "#ffe2ac";
//         case "#2382c5":
//             return "#c4edff";
//         case "#41c122":
//             return "#b0f575";
//     }
//     return color;
// }

class BoothLabelDrawer extends BoothDrawerBase<RectPainter> {
    private readonly factors: number[] = [];
    private previousVisiblePrefix: typeof prefixes[number];
    private previousSkipDim: boolean;
    public locked: boolean;
    // private readonly labelColor: string;
    // private readonly detailsHeight: number;

    constructor(context: DrawerContext, booth: RegularBooth) {
        super(context, booth, "booth-label", RectPainter, 130);
        this.locked = context.updatable;
        // initPainter(this.painter);

        // if (booth.special === true || booth.onHold || booth.exhibitors.length > 0 || !booth.typeColor) this.labelColor = '#fff';
        // else this.labelColor = replaceColorTmp(booth.typeColor);
        // if (EFP_EXPO === "cbresupplypartner") this.labelColor = '#fff';
        // if (EFP_EXPO === "podcastmovement2019") this.labelColor = '#fff';

        // this.labelColor = '#fff';

        const r = this.booth.rect;

        const dotCanvas = createCircleCanvas(1.5, context.pixelRatio);
        const dotW = dotCanvas.canvas.width / 2;
        const dotH = dotCanvas.canvas.width / 2;

        this.painter.addObject({
            id: this.getId("Dot"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            deltas: [0, 0, 0, 0],
            deltaPts: [-dotW, -dotH, dotW, dotH],
            canvasTmp: dotCanvas.canvas,
            texPosition: "center",
            visible: false
        });

        this.addLabel(7, "XS");
        this.addLabel(10, "S");
        this.addLabel(12, "M");
        this.addLabel(14, "L");

        const detailsCanvas = createDetailsCanvas(booth, context.pixelRatio);
        // this.detailsHeight = detailsCanvas.height;

        const pad = settings.borderWidth / 2;

        this.painter.addObject({
            id: this.getId("Details"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2 + pad, -r.h / 2 + pad, r.w / 2 - pad, r.h / 2 - pad],
            deltaPts: [3, 3, -1, -1],
            scalePts: context.pixelRatio,
            canvasTmp: detailsCanvas,
            texPosition: "lefttop",
            visible: false
        });

        this.calcFactors();
        this.update();

        if (context.updatable) {
            context.subscribePtscaleChange(() => context.requireUpdate(this.updateBound));
            reaction(() => booth.skipDim, () => context.requireUpdate(this.updateBound));
        }
        // updates.push(this.updateBound);
    }

    calcFactors() {
        let lastFactor: number;
        const r = this.booth.rect;

        for (const p of prefixes.slice(0, prefixes.length - 1)) {
            const cr = this.painter.getObject(this.getId(p)).canvasTmp;
            const xFactor = r.w / cr.width; //Math.min(cr.height * 5, cr.width);
            const yFactor = r.h / cr.height;

            lastFactor = Math.min(xFactor, yFactor);
            this.factors.push(lastFactor);
        }

        // Details are show at:
        this.factors.push(lastFactor / 1.8);
    }

    unlock() {
        this.locked = false;
        this.update();
    }

    update() {
        // if (!canDraw) return;
        // if (!canUpdate) return;
        // if (this.painter.alpha === 0) return;
        if (this.locked) return;
        let visiblePrefix: typeof prefixes[number] = null;
        const ptscale = this.context.getPtscale();
        // const rectHeight = this.booth.rect.h * ptscale;

        for (let i = 0; i < prefixes.length; i++) {
            const p = prefixes[i];
            const f = this.factors[i];
            if (ptscale < f) visiblePrefix = p;
        }

        // visiblePrefix = "Dot";

        if (visiblePrefix !== this.previousVisiblePrefix) {
            if (visiblePrefix) this.painter.updateVisible(this.getId(visiblePrefix), true);
            if (this.previousVisiblePrefix) this.painter.updateVisible(this.getId(this.previousVisiblePrefix), false);
            this.previousVisiblePrefix = visiblePrefix;
        }

        const newSkipDim = this.booth.skipDim;
        if (newSkipDim !== this.previousSkipDim) {
            for (const p of prefixes) {
                this.painter.updateSkipdim(this.getId(p), newSkipDim);
            }
            this.previousSkipDim = newSkipDim;
        }
    }

    addLabel(fontSize: number, sizeName: string) {
        const b = this.booth;
        const r = b.rect;

        const canvas = createLabelCanvas(b.name, fontSize, this.context.pixelRatio);
        const w = canvas.width / 2;
        const h = canvas.height / 2;

        this.painter.addObject({
            id: this.getId(sizeName),
            rotateRadians: this.booth.rotate,
            center: [r.cx, r.cy],
            deltas: [0, 0, 0, 0],
            deltaPts: [-w, -h, w, h],
            canvasTmp: canvas,
            texPosition: "center",
            visible: false
        });
    }
}

// subscribePtscaleChange(() => {
//     allDrawers.forEach(d => d.updateVisibleLabel());
// });
// subscribe to scale changes
