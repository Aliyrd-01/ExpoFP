import Color from "color";
import settings from "@/settings";
import { BoothDrawerBase } from "./config-booths-base";
import { createCircleCanvas, createLabelCanvas, createDetailsCanvas } from "./canvases";
import { subscribePtscaleChange, getPtscale } from "./matrix";
import { delayAnimations, requireUpdate } from "./draw";
import Drawer from "./Drawer";
import animate from "./animate";

const dotCanvas = createCircleCanvas(1.5 * devicePixelRatio);
const dotW = dotCanvas.width / 2;
const dotH = dotCanvas.width / 2;

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

export default class BoothLabelDrawer extends BoothDrawerBase {
    private readonly factors: number[] = [];

    constructor(booth: Booth) {
        super(booth, "booth-label");
        initDrawer(this.drawer);

        const r = this.booth.rect;

        this.drawer.addObject({
            id: this.getId("Dot"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            deltas: [0, 0, 0, 0],
            deltaPts: [-dotW, -dotH, dotW, dotH],
            canvasTmp: dotCanvas,
            texPosition: "center"
        });

        this.addLabel(7, "XS");
        this.addLabel(10, "S");
        this.addLabel(12, "M");
        this.addLabel(14, "L");

        const detailsCanvas = createDetailsCanvas(this.booth);

        this.drawer.addObject({
            id: this.getId("Details"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
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
            texPosition: "center"
        });
    }
}

// subscribePtscaleChange(() => {
//     allDrawers.forEach(d => d.updateVisibleLabel());
// });
// subscribe to scale changes
