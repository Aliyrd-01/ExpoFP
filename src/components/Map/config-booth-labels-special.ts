import BoothDrawerBase from "./BoothDrawerBase";
import { createCircleCanvas, createLabelCanvas, createDetailsCanvas, getFont, createMultilineTextCanvas } from "./canvases";
import { subscribePtscaleChange, getPtscale } from "./matrix";
import { delayAnimations, requireUpdate, requireRedraw } from "./draw";
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

export default function configBoothLabelsSpecial(booth: Booth) {
    if (!booth.special) return null;
    if (booth.noLabels) return null;
    return new BoothLabelSpecialDrawer(booth);
}

class BoothLabelSpecialDrawer extends BoothDrawerBase<Drawer> {
    private readonly steps: TextFitData[];
    private readonly ids: string[];

    constructor(booth: Booth) {
        super(booth, "booth-label-special", Drawer, 130);
        initDrawer(this.drawer);

        let r = this.booth.rect;
        r = r.withPadding(r.w * 0.1, r.h * 0.1);
        const text = this.booth.title || this.booth.name;

        this.steps = textFitter.getStepsForRect(text, r.w, r.h);
        this.ids = [];

        for (const s of this.steps) {
            const canvasTmp = createMultilineTextCanvas(s.lines, s.width, s.fontSize);
            const id = this.getId(s.factor.toString());
            this.drawer.addObject({
                id,
                rotateRadians: booth.rotate,
                center: [r.cx, r.cy],
                deltas: [0, 0, 0, 0],
                deltaPts: [-canvasTmp.width / 2, -canvasTmp.height / 2, canvasTmp.width / 2, canvasTmp.height / 2],
                canvasTmp: canvasTmp,
                texPosition: "center",
                visible: false
            });
            this.ids.push(id);
        }

        const dotCanvas = createCircleCanvas(1.5, "#fff");
        const dotW = dotCanvas.canvas.width / 2;
        const dotH = dotCanvas.canvas.width / 2;
        const dotId = this.getId("Dot");
        this.drawer.addObject({
            id: dotId,
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            deltas: [0, 0, 0, 0],
            deltaPts: [-dotW, -dotH, dotW, dotH],
            canvasTmp: dotCanvas.canvas,
            texPosition: "center",
            visible: false
        });

        this.ids.push(dotId);

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

        let timeoutId: number;
        subscribePtscaleChange(() => {
            if (timeoutId) {
                window.clearTimeout(timeoutId);
            }

            timeoutId = window.setTimeout(() => {
                requireUpdate(this.updateBound)
                timeoutId = undefined;
            }, 20);
        });
        updates.push(this.updateBound);
    }

    // calcFactors() {
    //     // let lastFactor: number;
    //     // const r = this.booth.rect;

    //     // for (const p of prefixes.slice(0, prefixes.length - 1)) {
    //     //     const cr = this.drawer.getObject(this.getId(p)).canvasTmp;
    //     //     const xFactor = r.w / cr.width;//Math.min(cr.height * 5, cr.width);
    //     //     const yFactor = r.h / cr.height;

    //     //     lastFactor = Math.min(xFactor, yFactor);
    //     //     this.steps.push(lastFactor);
    //     // }

    //     // // Details are show at:
    //     // this.steps.push(lastFactor / 1.8);
    // }

    // lastCall: number;
    // timeoutId: number;
    // update() {
    //     if (this.timeoutId) {
    //         window.clearTimeout(this.timeoutId);
    //     }

    //     this.timeoutId = window.setTimeout(() => {
    //         this.updateAction();
    //         requireRedraw();
    //         this.timeoutId = undefined;

    //     }, 100);
    // }

    update() {
        // if (!canDraw) return;
        if (!canUpdate) return;
        console.log('updateAction')
        // let visiblePrefix = "";
        const ptscale = getPtscale();
        // find first with factor larger than this
        const step = this.steps.find(s => s.factor < 1 / ptscale);
        const visibleId = this.getId(step ? step.factor.toString() : "Dot");

        for (const id of this.ids) {
            // var obj = this.drawer.getObject(id);
            // if (!obj) debugger;
            this.drawer.updateVisible(id, id === visibleId);
            this.drawer.updateSkipdim(id, this.getBoothState().skipDim);
        }
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
