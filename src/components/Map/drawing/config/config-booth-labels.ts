import { reaction } from "mobx";
import { boothStore, uiState } from "../../../../store";
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

const prefixes = ["Dot", "S", "M", "L", "XL"];

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

        const pad = boothStore.borderWidth / 2;

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

        this.addLabel(4 * context.pixelRatio, "PDF", pad / 8, true);
        this.addLabel(9 * context.pixelRatio, "S", pad / 8, true);
        this.addLabel(10 * context.pixelRatio, "M", pad / 8, false);
        this.addLabel(11 * context.pixelRatio, "L", pad, false);
        this.addLabel(12 * context.pixelRatio, "XL", pad, false);

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

        for (const p of prefixes) {
            const cr = this.painter.getObject(this.getId(p)).canvasTmp;
            let xFactor: number;
            let yFactor: number;

            let exh = (this.booth as RegularBooth).exhibitors.map((e) => e.name.replace(/ /g, "").length);
            if (exh.length) {
                let len = exh.sort((e1, e2) => e2 - e1)[0];
                xFactor = (r.w / cr.width) * (len / 5);
                yFactor = (r.h / cr.height) * (exh.length + 1);
            } else {
                xFactor = r.w / cr.width;
                yFactor = r.h / cr.height;
            }

            lastFactor = Math.min(xFactor, yFactor);
            this.factors.push(lastFactor);
        }

        // Details are show at:
        //this.factors.push(lastFactor / 3);
    }

    unlock() {
        this.locked = false;
        this.update();
    }

    update() {
        if (this.locked) return;
        let visiblePrefix: typeof prefixes[number] = "S";
        const ptscale = this.context.ptscale;

        for (let i = 0; i < prefixes.length; i++) {
            const p = prefixes[i];
            const f = this.factors[i];
            if (ptscale < f) visiblePrefix = p;
        }

        if (uiState.printingPdf && visiblePrefix === "Dot") visiblePrefix = "PDF";

        //console.info(visiblePrefix);

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
