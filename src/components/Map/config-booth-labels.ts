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
        updates.forEach(u => u());
        animate(0, 300, d3.easeLinear, d3.interpolateNumber(0, 1), v => (drawer.alpha = v));
    }, delayAnimations + 800);
}

export default function configBoothLabels(booth: Booth) {
    if (booth.noLabels) return null;
    return new BoothLabelDrawer(booth);
}

function replaceColorTmp(color: string) {
    switch (color) {
        case "#ffcd31":
            return "#ffe2ac";
        case "#2382c5":
            return "#c4edff";
        case "#41c122":
            return "#b0f575";
    }
    return color;
}

class BoothLabelDrawer extends BoothDrawerBase<Drawer> {
    private readonly factors: number[] = [];
    private readonly labelColor: string;

    constructor(booth: Booth) {
        super(booth, "booth-label", Drawer, 130);
        initDrawer(this.drawer);

        if (booth.special === true || booth.onHold || booth.exhibitors.length > 0 || !booth.typeColor) this.labelColor = '#fff';
        else this.labelColor = replaceColorTmp(booth.typeColor);

        const r = this.booth.rect;

        const dotCanvas = createCircleCanvas(1.5, this.labelColor);
        const dotW = dotCanvas.canvas.width / 2;
        const dotH = dotCanvas.canvas.width / 2;

        this.drawer.addObject({
            id: this.getId("Dot"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            deltas: [0, 0, 0, 0],
            deltaPts: [-dotW, -dotH, dotW, dotH],
            canvasTmp: dotCanvas.canvas,
            texPosition: "center"
        });

        this.addLabel(7, "XS");
        this.addLabel(10, "S");
        this.addLabel(12, "M");
        this.addLabel(14, "L");

        const detailsCanvas = createDetailsCanvas(this.booth, this.labelColor);

        const pad = settings.borderWidth / 2;

        this.drawer.addObject({
            id: this.getId("Details"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2 + pad, -r.h / 2 + pad, r.w / 2 - pad, r.h / 2 - pad],
            deltaPts: [3, 3, -1, -1],
            scalePts: devicePixelRatio,
            canvasTmp: detailsCanvas,
            texPosition: "lefttop"
        });

        this.calcFactors();
        this.update();

        subscribePtscaleChange(() => requireUpdate(this.updateBound));
        updates.push(this.updateBound);
    }

    calcFactors() {
        let lastFactor: number;
        const r = this.booth.rect;

        for (const p of prefixes.slice(0, prefixes.length - 1)) {
            const cr = this.drawer.getObject(this.getId(p)).canvasTmp;
            const xFactor = r.w / cr.width;
            const yFactor = r.h / cr.height;
            lastFactor = Math.min(xFactor, yFactor);
            this.factors.push(lastFactor);
        }

        this.factors.push(lastFactor / 1.8);
    }

    update() {
        // if (!canDraw) return;
        if (!canUpdate) return;
        let visiblePrefix = "";
        const ptscale = getPtscale();

        for (let i = 0; i < prefixes.length; i++) {
            const p = prefixes[i];
            const f = this.factors[i];
            if (ptscale < f) visiblePrefix = p;
        }

        if (EFP_EXPO === "awsamsterdam19" && this.booth.slug.startsWith("_food") && visiblePrefix !== "Dot") {
            // console.debug("awsamsterdam1");
            visiblePrefix = "Details";
        }

        if (this.booth.special && visiblePrefix !== "Dot") {
            visiblePrefix = "Details";
        }

        for (const p of prefixes) {
            var obj = this.drawer.getObject(this.getId(p));
            if (!obj) debugger;
            this.drawer.updateVisible(this.getId(p), p === visiblePrefix);
            this.drawer.updateSkipdim(this.getId(p), this.getBoothState().skipDim);
        }
    }



    addLabel(fontSize: number, sizeName: string) {
        const b = this.booth;
        const r = b.rect;

        const canvas = createLabelCanvas(b.name, fontSize, this.labelColor);
        const w = canvas.width / 2;
        const h = canvas.height / 2;

        this.drawer.addObject({
            id: this.getId(sizeName),
            rotateRadians: this.booth.rotate,
            center: [r.cx, r.cy],
            deltas: [0, 0, 0, 0],
            deltaPts: [-w, -h, w, h],
            canvasTmp: canvas,
            texPosition: "center"
        });
    }
}

// subscribePtscaleChange(() => {
//     allDrawers.forEach(d => d.updateVisibleLabel());
// });
// subscribe to scale changes
