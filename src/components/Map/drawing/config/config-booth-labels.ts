import { reaction } from "mobx";
import data from "../../../../data";
import store, { boothStore } from "../../../../store";
import { Booth, RegularBooth } from "../../../../store/BoothStore";
import settings from "../../../../tools/settings";
import { DrawerContext } from "../Drawer1";
import RectPainter, { RectPainterOptions } from "../painters/RectPainter";
import { uiState } from "./../../../../store/index";
import BoothDrawerBase from "./BoothDrawerBase";
import { createCircleCanvas, createDetailsCanvas, createExhibitorsDetailsCanvas, createLabelCanvas } from "./canvases";
import { NumberObserver } from "./NumberObserver";
import isMobile from "../../../../utils/is-mobile";
import isWebview from "../../../../utils/is-webview";

// const dotCanvas = createCircleCanvas(1.5, "#fff");
// const dotW = dotCanvas.canvas.width / 2;
// const dotH = dotCanvas.canvas.width / 2;

let fillStyle = settings.boothLabelColor;

if (settings.EXPO === "tqs2021") fillStyle = "#000";

const isMobileDevice = isMobile || isWebview;

let prefixes = (
    isMobileDevice
        ? ["Dot", "XS", "S", "Details"]
        : ["Dot", "XS", "S", "M", "L", "Details"]
);

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

export default function configBoothLabels(
    context: DrawerContext,
    layerID: string,
    booth: Booth,
    painterOrderPriority: number,
    visible: boolean
) {
    if (!(booth instanceof RegularBooth) || booth.noLabels) return;
    const color = booth.labelColor || fillStyle;
    const id = `${layerID}-booth-label-regular-${color}`;
    return new BoothLabelDrawer(context, id, booth, painterOrderPriority, visible, { color });
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

class BoothLabelDrawer extends BoothDrawerBase<RectPainter, RectPainterOptions> {
    private readonly factors: number[] = [];
    private previousVisiblePrefix: typeof prefixes[number];
    private previousSkipDim: boolean;
    public locked: boolean;
    // private readonly labelColor: string;
    // private readonly detailsHeight: number;

    constructor(context: DrawerContext, layerID: string, booth: RegularBooth, painterOrderPriority: number, visible: boolean, options: RectPainterOptions) {
        super(context, booth, layerID, RectPainter, painterOrderPriority, visible, options);
        this.locked = context.updatable;
        // initPainter(this.painter);

        // if (booth.special === true || booth.onHold || booth.exhibitors.length > 0 || !booth.typeColor) this.labelColor = '#fff';
        // else this.labelColor = replaceColorTmp(booth.typeColor);
        // if (EFP_EXPO === "cbresupplypartner") this.labelColor = '#fff';
        // if (EFP_EXPO === "podcastmovement2019") this.labelColor = '#fff';

        // this.labelColor = '#fff';

        const r = this.booth.rect;

        const color = booth.labelColor || fillStyle;

        const dotCanvas = createCircleCanvas(1.5, context.pixelRatio, color);
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

        if (isMobileDevice && this.painter.optimizationLevel >= 3) {
            prefixes = ["Dot", "XS", "Details"];
        }

        const mobileLabelSizes = this.getMobileLabelSizes();

        let exh = data.hideExhibitors
            ? []
            : !data.onlyFeaturedExhibitors
            ? booth.exhibitors
            : booth.exhibitors.filter((e) => e.featured);

        const pad = booth.borderWidth / 2 || boothStore.borderWidth / 2;

        if (!exh.length) {
            if (isMobileDevice) {
                mobileLabelSizes.forEach(labelSize => {
                    if (!labelSize.exhibitorsLabel) {
                        this.addLabel(labelSize.fontSize, labelSize.sizeName, color);
                    }
                })
            } else {
                this.addLabel(7, "XS", color);
                this.addLabel(10, "S", color);
                this.addLabel(12, "M", color);
                this.addLabel(14, "L", color);
            }

            const textAlign = uiState.rtl ? "right" : "left";
            const texPosition = uiState.rtl ? "righttop" : "lefttop";
            const deltaPts: [number, number, number, number] = uiState.rtl ? [1, 3, -3, -3] : [3, 3, -1, -1];

            const { pRatio, fSize } = this.adjustRatioAndFontSize(18);
            this.painter.addObject({
                id: this.getId("Details"),
                rotateRadians: booth.rotate,
                center: [r.cx, r.cy],
                deltas: [-r.w / 2 + pad, -r.h / 2 + pad, r.w / 2 - pad, r.h / 2 - pad],
                deltaPts,
                scalePts: context.pixelRatio,
                canvasTmp: createDetailsCanvas(booth, pRatio, color, fSize, !!booth.exhibitors.length, textAlign),
                texPosition,
                visible: false,
            });
        } else {
            if (isMobileDevice) {
                mobileLabelSizes.forEach(labelSize => {
                    this.addExhibitorsLabel(labelSize.fontSize, labelSize.sizeName, pad, !labelSize.exhibitorsLabel, color);
                })
            } else {
                this.addExhibitorsLabel(7, "XS", pad, true, color);
                this.addExhibitorsLabel(10, "S", pad, true, color);
                this.addExhibitorsLabel(12, "M", pad, true, color);
                this.addExhibitorsLabel(14, "L", pad, true, color);
                this.addExhibitorsLabel(18, "Details", pad, false, color);
            }
        }

        this.calcFactors(exh.length > 0);

        this.update();

        if (context.updatable) {
            const cru = () => context.requireUpdate(this.updateBound);
            // context.subscribePtscaleChange(() => context.requireUpdate(this.updateBound));
            // reaction(() => booth.skipDim, () => context.requireUpdate(this.updateBound));
            const obs = NumberObserver.singletonForObject("labels", () => context.ptscale);
            this.factors.forEach((f) => obs.observeValue(f, cru));
            reaction(() => booth.skipDim, cru);
            reaction(() => store.routeStore.routeLines, cru);
        }
        // updates.push(this.updateBound);
    }

    getMobileLabelSizes(): { fontSize: number; sizeName: string; exhibitorsLabel?: boolean }[] {
        return [
            { fontSize: 7, sizeName: "XS" },
            { fontSize: 10, sizeName: "S" },
            { fontSize: 16, sizeName: "Details", exhibitorsLabel: true },
        ];
    }

    calcFactors(exh: boolean) {
        let lastFactor: number;
        const r = this.booth.rect;

        for (const p of prefixes.slice(0, exh ? prefixes.length : prefixes.length - 1)) {
            const cr = this.painter.getObject(this.getId(p)).canvasTmp;
            const xFactor = r.w / (cr.w || cr.width);
            const yFactor = r.h / (cr.h || cr.height);

            lastFactor = Math.min(xFactor, yFactor);
            this.factors.push(lastFactor);
        }

        // Details are show at:
        if (!exh) this.factors.push(lastFactor / 1.8);
    }

    unlock() {
        this.locked = false;
        this.update();
    }

    update() {
        // if (!canDraw) return;
        // if (!canUpdate) return;
        // if (this.painter.alpha === 0) return;
        if (this.locked) return;
        let visiblePrefix: typeof prefixes[number] = null;
        const ptscale = this.context.ptscale;
        // const rectHeight = this.booth.rect.h * ptscale;

        for (let i = 0; i < prefixes.length; i++) {
            const p = prefixes[i];
            const f = this.factors[i];
            if (ptscale < f) visiblePrefix = p;
        }

        // console.log('boothupdate');

        if (uiState.printingPdf && visiblePrefix === "Dot") visiblePrefix = "XS";

        if (visiblePrefix !== this.previousVisiblePrefix) {
            if (visiblePrefix) this.painter.updateVisible(this.getId(visiblePrefix), true);
            if (this.previousVisiblePrefix) this.painter.updateVisible(this.getId(this.previousVisiblePrefix), false);
            this.previousVisiblePrefix = visiblePrefix;
        }

        const newSkipDim = this.booth.skipDim || !!store.routeStore.routeLines.length;
        if (newSkipDim !== this.previousSkipDim) {
            for (const p of prefixes) {
                this.painter.updateSkipdim(this.getId(p), newSkipDim);
            }
            this.previousSkipDim = newSkipDim;
        }
    }

    addExhibitorsLabel(fontSize: number, sizeName: string, padding: number, short: boolean, color: string) {
        const b = this.booth;
        const r = b.rect;

        const textAlign = uiState.rtl ? "right" : "left";
        const texPosition = uiState.rtl ? "righttop" : "lefttop";
        const deltaPts: [number, number, number, number] = uiState.rtl ? [1, 3, -3, -3] : [3, 3, -1, -1];


        const { pRatio, fSize } = this.adjustRatioAndFontSize(fontSize);
        const canvas = createExhibitorsDetailsCanvas(
            b as RegularBooth,
            pRatio,
            color,
            fSize,
            data.hideExhibitorBoothNumber || short,
            data.onlyFeaturedExhibitors,
            textAlign,
            isMobileDevice && this.painter.optimizationLevel >= 3 ? 1 : 3,
        );

        const pad = padding;

        this.painter.addObject({
            id: this.getId(sizeName),
            rotateRadians: this.booth.rotate,

            center: [r.cx, r.cy],
            deltas: [-r.w / 2 + pad, -r.h / 2 + pad, r.w / 2 - pad, r.h / 2 - pad],
            deltaPts,

            canvasTmp: canvas,
            texPosition,
            visible: false,
        });
    }

    addLabel(fontSize: number, sizeName: string, color: string) {
        const b = this.booth;
        const r = b.rect;

        const { pRatio, fSize } = this.adjustRatioAndFontSize(fontSize);
        const canvas = createLabelCanvas(b.name, fSize, pRatio, color, 500);
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
            visible: false,
        });
    }

    adjustRatioAndFontSize(fontSize: number): { pRatio: number; fSize: number } {
        let pRatio = this.context.pixelRatio;
        let fSize = fontSize;

        if (isMobileDevice && this.painter.optimizationLevel >= 2) {
            pRatio = Math.max(1, pRatio - this.painter.optimizationLevel);
            fSize = Math.max(fontSize, fontSize * (this.context.pixelRatio / pRatio));
        }

        return { pRatio, fSize };
    }
}