import { observable } from "mobx";
import { Booth, SpecialBooth } from "../../../core/Booth";
import noop from "../../../utils/noop";
import DrawerImpl from "../DrawerImpl";
import RectPainter from "../painters/RectPainter";
import BoothDrawerBase from "./BoothDrawerBase";
import { createCircleCanvas, createMultilineTextCanvas, getFont } from "./canvases";
import observeNumbers from "./observeNumbers";
import TextFitter, { TextFitData } from "./TextFitter";

const textFitters = new Map<number, TextFitter>();
function cteateTextFitter(pixelRatio: number) {
    let d = textFitters.get(pixelRatio);
    if (!d) {
        const allowedFontSizes = [18, 16, 14, 12, 10, 7].map(f => f * pixelRatio);
        const maxMultilineFontSize = 14 * pixelRatio;
        d = new TextFitter(getFont, allowedFontSizes, maxMultilineFontSize);
        textFitters.set(pixelRatio, d);
        // cleanup
        setTimeout(() => textFitters.delete(pixelRatio), 5000);
    }
    return d;
}

export default function configBoothLabelsSpecial(context: DrawerImpl, booth: Booth) {
    if (!(booth instanceof SpecialBooth) || booth.noLabels) return noop;
    if (booth.noLabels) return noop;
    const dr = new BoothLabelSpecialDrawer(context, booth);
    return dr.dispose.bind(dr);
}

class BoothLabelSpecialDrawer extends BoothDrawerBase<RectPainter> {
    private readonly steps: TextFitData[];
    private readonly ids: string[];
    private previousVisibleId: string;
    private previousSkipDim: boolean;
    private readonly disposeNumberObserver: () => void;
    // public locked: boolean;

    constructor(context: DrawerImpl, booth: Booth) {
        super(context, booth, "booth-label", RectPainter, 130);
        // this.locked = context.updatable;

        let r = this.booth.rect;
        r = r.withPadding(r.w * 0.05, r.h * 0.05);
        const text = this.booth.title || this.booth.name;

        this.steps = cteateTextFitter(context.config.pixelRatio).getStepsForRect(text, r.w, r.h);
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

        const dotCanvas = createCircleCanvas(1.5, context.config.pixelRatio);
        const dotW = dotCanvas.width / 2;
        const dotH = dotCanvas.width / 2;
        const dotId = this.getId("Dot");
        this.painter.addObject({
            id: dotId,
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            deltas: [0, 0, 0, 0],
            deltaPts: [-dotW, -dotH, dotW, dotH],
            canvasTmp: dotCanvas,
            texPosition: "center",
            visible: false
        });

        this.ids.push(dotId);

        
        // this.update();

        this.disposeNumberObserver = observeNumbers(
            () => 1 / context.ptscale,
            [context, "labels-special"],
            this.steps.map(x => x.factor),
            () => {
                this.ptscaleAfterObserver = context.ptscale;
            }
        );

        this.startAutoupdate();

        // const obs = NumberObserver.singletonForObject("labels-special" + context.config.pixelRatio, () => 1 / context.ptscale);
        // this.steps.forEach(s =>
        //     obs.observeValue(s.factor, () => {
        //         this.ptscaleAfterObserver = context.ptscale;
        //     })
        // );

        // if (context.updatable) {
        //     const cru = () => context.requireUpdate(this.updateBound);
        //     // context.subscribePtscaleChange(() => context.requireUpdate(this.updateBound));
        //     // reaction(() => booth.skipDim, () => context.requireUpdate(this.updateBound));
        //     const obs = NumberObserver.singletonForObject("labels-special" + context.config.pixelRatio, () => 1 / context.ptscale);
        //     this.steps.forEach(s => obs.observeValue(s.factor, cru));
        //     reaction(() => booth.skipDim, cru);

        //     // context.subscribePtscaleChange(() => context.requireUpdate(this.updateBound));
        //     // reaction(() => [booth.skipDim, context.ptscale], () => context.requireUpdate(this.updateBound));
        // }
    }

    dispose() {
        super.dispose();
        this.disposeNumberObserver();
    }

    // unlock() {
    //     this.locked = false;
    //     this.update();
    // }
    @observable ptscaleAfterObserver;

    update() {
        // if (this.locked) return;
        // if (!canUpdate) return;

        const ptscale = this.ptscaleAfterObserver;
        // find first with factor larger than this
        const step = this.steps.find(s => s.factor < 1 / ptscale);
        const visibleId = this.getId(step ? step.factor.toString() : "Dot");

        if (visibleId !== this.previousVisibleId) {
            if (visibleId) this.painter.updateVisible(visibleId, true);
            if (this.previousVisibleId) this.painter.updateVisible(this.previousVisibleId, false);
            this.previousVisibleId = visibleId;
        }

        const newSkipDim = this.booth.skipDim;
        if (newSkipDim !== this.previousSkipDim) {
            for (const id of this.ids) {
                this.painter.updateSkipdim(id, newSkipDim);
            }
            this.previousSkipDim = newSkipDim;
        }
    }
}
