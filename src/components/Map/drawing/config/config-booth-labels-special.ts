import BoothDrawerBase from "./BoothDrawerBase";
import { createCircleCanvas, getFont, createMultilineTextCanvas } from "./canvases";
import TextFitter, { TextFitData } from "./TextFitter";
import { DrawerContext } from "../drawer";
import RectPainter from "../painters/RectPainter";

// let canUpdate = false;
// const updates = [];
// let drawer: Drawer;
const pixelRatio = devicePixelRatio;
const allowedFontSizes = [18, 16, 14, 12, 10, 7].map(f => f * pixelRatio);
const maxMultilineFontSize = 14 * pixelRatio;
const textFitter = new TextFitter(getFont, allowedFontSizes, maxMultilineFontSize);

// function initDrawer(drawer1: Drawer) {
//     if (drawer) return;
//     drawer = drawer1;
//     drawer.alpha = 0;

//     window.setTimeout(() => {
//         canUpdate = true;
//         updates.forEach(u => u());
//         animate(0, 300, d3.easeLinear, d3.interpolateNumber(0, 1), v => (drawer.alpha = v));
//     }, delayAnimations + 800);
// }

export default function configBoothLabelsSpecial(context: DrawerContext, booth: Booth) {
    if (!booth.special) return;
    if (booth.noLabels) return;
    return new BoothLabelSpecialDrawer(context, booth);
}

class BoothLabelSpecialDrawer extends BoothDrawerBase<RectPainter> {
    private readonly steps: TextFitData[];
    private readonly ids: string[];
    private previousVisibleId: string;
    private previousSkipDim: boolean;
    public locked = true;

    constructor(context: DrawerContext, booth: Booth) {
        super(context, booth, "booth-label", RectPainter, 130);
        // initDrawer(this.drawer);

        let r = this.booth.rect;
        r = r.withPadding(r.w * 0.05, r.h * 0.05);
        const text = this.booth.title || this.booth.name;

        this.steps = textFitter.getStepsForRect(text, r.w, r.h);
        this.ids = [];

        for (const s of this.steps) {
            const canvasTmp = createMultilineTextCanvas(s.lines, s.width, s.fontSize);
            const id = this.getId(s.factor.toString());
            this.painter.addObject({
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
        this.painter.addObject({
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

        this.context.subscribePtscaleChange(() => this.context.requireUpdate(this.updateBound));
        store.watchBoothState(booth.id, () => this.context.requireUpdate(this.updateBound), "skipDim");
        // updates.push(this.updateBound);
    }

    unlock(){
        this.locked = false;
        this.update();
    }
    
    update() {
        if (this.locked) return;
        // if (!canUpdate) return;
        // console.log('updateAction')
        // let visiblePrefix = "";
        const ptscale = this.context.getPtscale();
        // find first with factor larger than this
        const step = this.steps.find(s => s.factor < 1 / ptscale);
        const visibleId = this.getId(step ? step.factor.toString() : "Dot");


        if (visibleId !== this.previousVisibleId) {
            if (visibleId) this.painter.updateVisible(visibleId, true);
            if (this.previousVisibleId) this.painter.updateVisible(this.previousVisibleId, false);
            this.previousVisibleId = visibleId;
        }

        const newSkipDim = this.getBoothState().skipDim;
        if (newSkipDim !== this.previousSkipDim) {
            for (const id of this.ids) {
                this.painter.updateSkipdim(id, newSkipDim);
            }
            this.previousSkipDim = newSkipDim;
        }
    }
}

