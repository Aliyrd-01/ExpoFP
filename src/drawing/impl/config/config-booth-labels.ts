import { observable } from "mobx";
import { Booth, RegularBooth } from "../../../core/Booth";
import DrawerImpl from "../DrawerImpl";
// import { boothStore } from "../../../../store";
import RectPainter from "../painters/RectPainter";
import BoothDrawerBase from "./BoothDrawerBase";
import { createCircleCanvas, createDetailsCanvas, createLabelCanvas } from "./canvases";
import { NumberObserver } from "./NumberObserver";

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

export default function configBoothLabels(context: DrawerImpl, booth: Booth) {
    if (!(booth instanceof RegularBooth) || booth.noLabels) return () => {};
    const dr = new BoothLabelDrawer(context, booth);
    return dr.dispose.bind(dr);
}

class BoothLabelDrawer extends BoothDrawerBase<RectPainter> {
    private readonly factors: number[] = [];
    private previousVisiblePrefix: typeof prefixes[number];
    private previousSkipDim: boolean;
    // public locked: boolean;

    constructor(context: DrawerImpl, booth: RegularBooth) {
        super(context, booth, "booth-label", RectPainter, 130);
        // this.locked = context.updatable;

        const config = context.config;
        const r = this.booth.rect;

        const dotCanvas = createCircleCanvas(1.5, config.pixelRatio);
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
            visible: false
        });

        this.addLabel(7, "XS");
        this.addLabel(10, "S");
        this.addLabel(12, "M");
        this.addLabel(14, "L");

        const detailsCanvas = createDetailsCanvas(booth, config.exhibitorNames, config.pixelRatio);

        const pad = config.borderWidth / 2;

        this.painter.addObject({
            id: this.getId("Details"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2 + pad, -r.h / 2 + pad, r.w / 2 - pad, r.h / 2 - pad],
            deltaPts: [3, 3, -1, -1],
            scalePts: config.pixelRatio,
            canvasTmp: detailsCanvas,
            texPosition: "lefttop",
            visible: false
        });

        this.calcFactors();

        this.startAutoupdate();
        // this.update();

        // if (context.updatable) {
        //     const cru = () => context.requireUpdate(this.updateBound);
        const obs = NumberObserver.singletonForObject("labels" + config.pixelRatio, () => context.ptscale);
        this.factors.forEach(f =>
            obs.observeValue(f, () => {
                this.ptscaleAfterObserver = context.ptscale;
            })
        );
        //reaction(() => booth.skipDim, cru);
        // }
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

    // unlock() {
    //     this.locked = false;
    //     this.update();
    // }

    @observable ptscaleAfterObserver;

    update() {
        // if (this.locked) return;
        let visiblePrefix: typeof prefixes[number] = null;
        const ptscale = this.ptscaleAfterObserver;

        for (let i = 0; i < prefixes.length; i++) {
            const p = prefixes[i];
            const f = this.factors[i];
            if (ptscale < f) visiblePrefix = p;
        }

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

        const canvas = createLabelCanvas(b.name, fontSize, this.context.config.pixelRatio);
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
