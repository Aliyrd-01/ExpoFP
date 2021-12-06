import { reaction } from "mobx";
import { boothStore } from "../../../../store";
import { Booth, RegularBooth } from "../../../../store/BoothStore";
import settings from "../../../../tools/settings";
import { DrawerContext } from "../Drawer1";
import RectPainter from "../painters/RectPainter";
import BoothDrawerBase from "./BoothDrawerBase";
import { createCircleCanvas, createDetailsCanvas } from "./canvases";
import { NumberObserver } from "./NumberObserver";

// const dotCanvas = createCircleCanvas(1.5, "#fff");
// const dotW = dotCanvas.canvas.width / 2;
// const dotH = dotCanvas.canvas.width / 2;

let fillStyle = "#fff";
if (settings.EXPO === "tqs2021") fillStyle = "#000";

const prefixes = ["Dot", /* "XS", "S", "M", */ "L", "Details"] as const;

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
        super(context, booth, "booth-label", RectPainter, 160);
        this.locked = context.updatable;
        // initPainter(this.painter);

        // if (booth.special === true || booth.onHold || booth.exhibitors.length > 0 || !booth.typeColor) this.labelColor = '#fff';
        // else this.labelColor = replaceColorTmp(booth.typeColor);
        // if (EFP_EXPO === "cbresupplypartner") this.labelColor = '#fff';
        // if (EFP_EXPO === "podcastmovement2019") this.labelColor = '#fff';

        // this.labelColor = '#fff';

        const r = this.booth.rect;

        const dotCanvas = createCircleCanvas(1.5, context.pixelRatio, fillStyle);
        const dotW = dotCanvas.width / 2;
        const dotH = dotCanvas.width / 2;

        this.painter.addObject({
            id: this.getId("Dot"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            deltas: [0, 0, 0, 0],
            deltaPts: [-dotW, -dotH, dotW, dotH],
            canvasTmp: dotCanvas,
            texPosition: "center",
            visible: false,
        });

        const pad = boothStore.borderWidth / 2;

        // this.addLabel(12, "XS", pad);
        // this.addLabel(12, "S", pad, false);
        // this.addLabel(13, "M", pad, false);
        this.addLabel(18 * context.pixelRatio, "L", pad, true);

        const detailsCanvas = createDetailsCanvas(booth, context.pixelRatio, fillStyle, 14 * context.pixelRatio, false);
        // this.detailsHeight = detailsCanvas.height;

        this.painter.addObject({
            id: this.getId("Details"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2 + pad, -r.h / 2 + pad, r.w / 2 - pad, r.h / 2 - pad],
            deltaPts: [3, 3, -1, -1],
            scalePts: context.pixelRatio,
            canvasTmp: detailsCanvas,
            texPosition: "lefttop",
            visible: false,
        });

        this.calcFactors();
        this.update();

        if (context.updatable) {
            const cru = () => context.requireUpdate(this.updateBound);
            // context.subscribePtscaleChange(() => context.requireUpdate(this.updateBound));
            // reaction(() => booth.skipDim, () => context.requireUpdate(this.updateBound));
            const obs = NumberObserver.singletonForObject("labels", () => context.ptscale);
            this.factors.forEach((f) => obs.observeValue(f, cru));
            reaction(() => booth.skipDim, cru);
        }
        // updates.push(this.updateBound);
    }

    calcFactors() {
        let lastFactor: number;
        const r = this.booth.rect;

        for (const p of prefixes.slice(0, prefixes.length - 1)) {
            const cr = this.painter.getObject(this.getId(p)).canvasTmp;
            const xFactor = (r.w / cr.width) * 1.5; //Math.min(cr.height * 5, cr.width);
            const yFactor = (r.h / cr.height) * 1.5;

            lastFactor = Math.max(xFactor, yFactor);
            this.factors.push(lastFactor);
        }

        // Details are show at:
        this.factors.push(lastFactor / 3);
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
        const ptscale = this.context.ptscale;
        // const rectHeight = this.booth.rect.h * ptscale;

        for (let i = 0; i < prefixes.length; i++) {
            const p = prefixes[i];
            const f = this.factors[i];
            if (ptscale < f) visiblePrefix = p;
        }

        // console.log('boothupdate');

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

    addLabel(fontSize: number, sizeName: string, padding: number, short: boolean = true) {
        const b = this.booth;
        const r = b.rect;

        const canvas = createDetailsCanvas(b as RegularBooth, this.context.pixelRatio, fillStyle, fontSize, short);
        // const w = canvas.width / 2;
        // const h = canvas.height / 2;

        const pad = padding;

        this.painter.addObject({
            id: this.getId(sizeName),
            rotateRadians: this.booth.rotate,

            center: [r.cx, r.cy],
            deltas: [-r.w / 2 + pad, -r.h / 2 + pad, r.w / 2 - pad, r.h / 2 - pad],
            deltaPts: [3, 3, -1, -1],

            canvasTmp: canvas,
            texPosition: "lefttop",
            visible: false,
        });
    }
}
