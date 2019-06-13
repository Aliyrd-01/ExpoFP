import BoothDrawerBase from "./BoothDrawerBase";
import { createCircleCanvas, getFont, createMultilineTextCanvas } from "./canvases";
import { subscribePtscaleChange, getPtscale } from "./matrix";
import { delayAnimations, requireUpdate } from "./draw";
import Drawer from "./Drawer";
import animate from "./animate";
import TextFitter, { TextFitData } from "./TextFitter";

let canUpdate = false;
const updates = [];
let drawer: Drawer;
const pixelRatio = devicePixelRatio;
const allowedFontSizes = [18, 16, 14, 12, 10, 7].map(f => f * pixelRatio);
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
    private previousVisibleId: string;
    private previousSkipDim: boolean;

    constructor(booth: Booth) {
        super(booth, "booth-label-special", Drawer, 130);
        initDrawer(this.drawer);

        let r = this.booth.rect;
        r = r.withPadding(r.w * 0.05, r.h * 0.05);
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

        this.update();

        subscribePtscaleChange(() => requireUpdate(this.updateBound));
        updates.push(this.updateBound);
    }


    update() {
        // if (!canDraw) return;
        if (!canUpdate) return;
        // console.log('updateAction')
        // let visiblePrefix = "";
        const ptscale = getPtscale();
        // find first with factor larger than this
        const step = this.steps.find(s => s.factor < 1 / ptscale);
        const visibleId = this.getId(step ? step.factor.toString() : "Dot");


        if (visibleId !== this.previousVisibleId) {
            if (visibleId) this.drawer.updateVisible(visibleId, true);
            if (this.previousVisibleId) this.drawer.updateVisible(this.previousVisibleId, false);
            this.previousVisibleId = visibleId;
        }

        const newSkipDim = this.getBoothState().skipDim;
        if (newSkipDim !== this.previousSkipDim) {
            for (const id of this.ids) {
                this.drawer.updateSkipdim(id, newSkipDim);
            }
            this.previousSkipDim = newSkipDim;
        }
    }
}

