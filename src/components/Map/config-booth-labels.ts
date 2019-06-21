import Color from "color";
import BoothDrawerBase from "./BoothDrawerBase";
import { createCircleCanvas, createLabelCanvas, createDetailsCanvas } from "./canvases";
import { subscribePtscaleChange, getPtscale } from "./matrix";
import { delayAnimations, requireUpdate } from "./draw";
import Drawer from "./Drawer";
import animate from "./animate";
import settings from "@/settings";

// const dotCanvas = createCircleCanvas(1.5, "#fff");
// const dotW = dotCanvas.canvas.width / 2;
// const dotH = dotCanvas.canvas.width / 2;

const prefixes = ["Dot", "XS", "S", "M", "L", "Details"];

let canUpdate = false;
const updates = [];
let drawer: Drawer;
function initDrawer(drawer1: Drawer) {
    if (drawer) return;
    drawer = drawer1;
    drawer.alpha = 0;

    window.setTimeout(() => {
        canUpdate = true;
        drawer.alpha = 1;
        updates.forEach(u => u());
        animate(0, 300, d3.easeLinear, d3.interpolateNumber(0, 1), v => (drawer.alpha = v));
    }, delayAnimations + 800);
}

export default function configBoothLabels(booth: Booth) {
    if (booth.special === true || booth.noLabels) return;
    new BoothLabelDrawer(booth);
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

class BoothLabelDrawer extends BoothDrawerBase<Drawer> {
    private readonly factors: number[] = [];
    private previousVisiblePrefix: string;
    private previousSkipDim: boolean;
    // private readonly labelColor: string;
    // private readonly detailsHeight: number;

    constructor(booth: RegularBooth) {
        super(booth, "booth-label", Drawer, 130);
        initDrawer(this.drawer);

        // if (booth.special === true || booth.onHold || booth.exhibitors.length > 0 || !booth.typeColor) this.labelColor = '#fff';
        // else this.labelColor = replaceColorTmp(booth.typeColor);
        // if (EFP_EXPO === "cbresupplypartner") this.labelColor = '#fff';
        // if (EFP_EXPO === "podcastmovement2019") this.labelColor = '#fff';

        // this.labelColor = '#fff';

        const r = this.booth.rect;

        const dotCanvas = createCircleCanvas(1.5);
        const dotW = dotCanvas.canvas.width / 2;
        const dotH = dotCanvas.canvas.width / 2;

        this.drawer.addObject({
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

        const detailsCanvas = createDetailsCanvas(booth);
        // this.detailsHeight = detailsCanvas.height;

        const pad = settings.borderWidth / 2;

        this.drawer.addObject({
            id: this.getId("Details"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2 + pad, -r.h / 2 + pad, r.w / 2 - pad, r.h / 2 - pad],
            deltaPts: [3, 3, -1, -1],
            scalePts: devicePixelRatio,
            canvasTmp: detailsCanvas,
            texPosition: "lefttop",
            visible: false
        });

        this.calcFactors();
        this.update();

        subscribePtscaleChange(() => requireUpdate(this.updateBound));
        store.watchBoothState(booth.id, () => requireUpdate(this.updateBound), "skipDim");
        // updates.push(this.updateBound);
    }

    calcFactors() {
        let lastFactor: number;
        const r = this.booth.rect;

        for (const p of prefixes.slice(0, prefixes.length - 1)) {
            const cr = this.drawer.getObject(this.getId(p)).canvasTmp;
            const xFactor = r.w / cr.width;//Math.min(cr.height * 5, cr.width);
            const yFactor = r.h / cr.height;

            lastFactor = Math.min(xFactor, yFactor);
            this.factors.push(lastFactor);
        }

        // Details are show at:
        this.factors.push(lastFactor / 1.8);
    }


    update() {
        // if (!canDraw) return;
        if (!canUpdate) return;
        let visiblePrefix = "";
        const ptscale = getPtscale();
        // const rectHeight = this.booth.rect.h * ptscale;

        for (let i = 0; i < prefixes.length; i++) {
            const p = prefixes[i];
            const f = this.factors[i];
            if (ptscale < f) visiblePrefix = p;
        }

        if (visiblePrefix !== this.previousVisiblePrefix) {
            if (visiblePrefix) this.drawer.updateVisible(this.getId(visiblePrefix), true);
            if (this.previousVisiblePrefix) this.drawer.updateVisible(this.getId(this.previousVisiblePrefix), false);
            this.previousVisiblePrefix = visiblePrefix;
        }

        const newSkipDim = this.getBoothState().skipDim;
        if (newSkipDim !== this.previousSkipDim) {
            for (const p of prefixes) {
                this.drawer.updateSkipdim(this.getId(p), newSkipDim);
            }
            this.previousSkipDim = newSkipDim;
        }
    }

    addLabel(fontSize: number, sizeName: string) {
        const b = this.booth;
        const r = b.rect;

        const canvas = createLabelCanvas(b.name, fontSize);
        const w = canvas.width / 2;
        const h = canvas.height / 2;

        this.drawer.addObject({
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
