import BoothDrawerBase from "./BoothDrawerBase";
import { createCircleCanvas, createLabelCanvas, createDetailsCanvas, getFont } from "./canvases";
import { subscribePtscaleChange, getPtscale } from "./matrix";
import { delayAnimations, requireUpdate } from "./draw";
import Drawer from "./Drawer";
import animate from "./animate";
import settings from "@/settings";
import TextFitter, { TextFitData } from "./TextFitter";

let canUpdate = false;
const updates = [];
let drawer: Drawer;
const pixelRatio = devicePixelRatio;
const allowedFontSizes = [18, 16, 14, 12, 10, 9].map(f => f * pixelRatio);
const maxMultilineFontSize = 14 * pixelRatio;
const textFitter = new TextFitter(getFont, allowedFontSizes, maxMultilineFontSize);

function initDrawer(drawer1: Drawer) {
    if (drawer) return;
    drawer = drawer1;
    drawer.alpha = 0;

    window.setTimeout(() => {
        canUpdate = true;
        updates.forEach(u => u());
        animate(0, 300, d3.easeLinear, d3.interpolateNumber(0, 1), v => (drawer.alpha = v));
    }, delayAnimations + 800);
}

export default function configBoothLabels(booth: Booth) {
    if (!booth.special) return null;
    if (booth.noLabels) return null;
    return new BoothLabelSpecialDrawer(booth);
}

class BoothLabelSpecialDrawer extends BoothDrawerBase<Drawer> {
    private readonly steps: TextFitData[];

    constructor(booth: Booth) {
        super(booth, "booth-label", Drawer, 130);
        initDrawer(this.drawer);

        const r = this.booth.rect;
        const text = this.booth.title || this.booth.name;

        this.steps = textFitter.getStepsForRect(text, r.w, r.h);

        for (const s of this.steps) {

        }

        // const dotCanvas = createCircleCanvas(1.5, this.labelColor);
        // const dotW = dotCanvas.canvas.width / 2;
        // const dotH = dotCanvas.canvas.width / 2;

        // this.drawer.addObject({
        //     id: this.getId("Dot"),
        //     rotateRadians: booth.rotate,
        //     center: [r.cx, r.cy],
        //     deltas: [0, 0, 0, 0],
        //     deltaPts: [-dotW, -dotH, dotW, dotH],
        //     canvasTmp: dotCanvas.canvas,
        //     texPosition: "center"
        // });

        // this.addLabel(7, "XS");
        // this.addLabel(10, "S");
        // this.addLabel(12, "M");
        // this.addLabel(14, "L");

        // const detailsCanvas = createDetailsCanvas(this.booth, this.labelColor);
        // this.detailsHeight = detailsCanvas.height;

        // const pad = settings.borderWidth / 2;

        // this.drawer.addObject({
        //     id: this.getId("Details"),
        //     rotateRadians: booth.rotate,
        //     center: [r.cx, r.cy],
        //     deltas: [-r.w / 2 + pad, -r.h / 2 + pad, r.w / 2 - pad, r.h / 2 - pad],
        //     deltaPts: [3, 3, -1, -1],
        //     scalePts: devicePixelRatio,
        //     canvasTmp: detailsCanvas,
        //     texPosition: "lefttop"
        // });

        // this.calcFactors();
        this.update();

        subscribePtscaleChange(() => requireUpdate(this.updateBound));
        updates.push(this.updateBound);
    }

    calcFactors() {
        // let lastFactor: number;
        // const r = this.booth.rect;

        // for (const p of prefixes.slice(0, prefixes.length - 1)) {
        //     const cr = this.drawer.getObject(this.getId(p)).canvasTmp;
        //     const xFactor = r.w / cr.width;//Math.min(cr.height * 5, cr.width);
        //     const yFactor = r.h / cr.height;

        //     lastFactor = Math.min(xFactor, yFactor);
        //     this.steps.push(lastFactor);
        // }

        // // Details are show at:
        // this.steps.push(lastFactor / 1.8);
    }

    update() {
        // if (!canDraw) return;
        if (!canUpdate) return;
        // let visiblePrefix = "";
        // const ptscale = getPtscale();
        // const rectHeight = this.booth.rect.h * ptscale;

        // for (let i = 0; i < prefixes.length; i++) {
        //     const p = prefixes[i];
        //     const f = this.steps[i];
        //     if (ptscale < f) visiblePrefix = p;
        // }

        // if (EFP_EXPO === "awsamsterdam19" && this.booth.slug.startsWith("_food") && visiblePrefix !== "Dot") {
        //     // __logger.debug("awsamsterdam1");
        //     visiblePrefix = "Details";
        // }

        // if (this.booth.special && visiblePrefix !== "Dot" && this.booth.title && (this.booth.title.length > this.booth.name.length)) {
        //     visiblePrefix = "Details";
        // }

        // for (const p of prefixes) {
        //     var obj = this.drawer.getObject(this.getId(p));
        //     if (!obj) debugger;
        //     this.drawer.updateVisible(this.getId(p), p === visiblePrefix);
        //     this.drawer.updateSkipdim(this.getId(p), this.getBoothState().skipDim);
        // }
    }

    // addLabel(fontSize: number, sizeName: string) {
    //     const b = this.booth;
    //     const r = b.rect;

    //     const canvas = createLabelCanvas(b.name, fontSize, this.labelColor);
    //     const w = canvas.width / 2;
    //     const h = canvas.height / 2;

    //     this.drawer.addObject({
    //         id: this.getId(sizeName),
    //         rotateRadians: this.booth.rotate,
    //         center: [r.cx, r.cy],
    //         deltas: [0, 0, 0, 0],
    //         deltaPts: [-w, -h, w, h],
    //         canvasTmp: canvas,
    //         texPosition: "center"
    //     });
    // }
}

// subscribePtscaleChange(() => {
//     allDrawers.forEach(d => d.updateVisibleLabel());
// });
// subscribe to scale changes
