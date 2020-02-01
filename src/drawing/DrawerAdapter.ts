import { autorun } from "mobx";
import FloorPlanReady from "../floorplan.ready";
import { Drawer, DrawerLayer, DrawerUpdatables } from "./DrawerInterfaces";
import DrawerImpl from "./impl/DrawerImpl";
import Matrix from "./Matrix";

export default class DrawerAdapter {
    private readonly impl: Drawer;
    private readonly disposers: (() => void)[] = [];

    constructor(private fp: FloorPlanReady, canvas: HTMLCanvasElement, private m: Matrix) {
        this.impl = new DrawerImpl(canvas, m.pixelRatio, this.getUpdatables(), this.createLayers(), fp.svg);

        this.disposers.push(
            autorun(() => {
                this.impl.setUpdatables(this.getUpdatables());
            })
        );
    }

    private createLayers(): DrawerLayer[] {
        // const bgElements = select(this.fp.svg.svgElement)
        //     .select("#BG")
        //     .selectAll("path, rect")
        //     .nodes() as SVGElement[];

        // for (const el of bgElements) {
        //     if (el.tagName === "path") {
        //         addPath(el as SVGPathElement);
        //     } else if (el.tagName === "rect") {
        //         addRect(el as SVGRectElement);
        //     }
        // }

        return [];
    }

    private getUpdatables(): DrawerUpdatables {
        const uiState = this.fp.store.uiState;
        return {
            matrix: this.m.matrix,
            ptscale: this.m.ptscale,
            canvasVisibleRectPt: uiState.canvasVisibleRectPt,
            canvasSizePt: uiState.canvasSizePt,
            dimmed: uiState.dimmed
        };
    }

    dispose() {
        this.disposers.forEach(x => x());
        this.impl.dispose();
    }
}
