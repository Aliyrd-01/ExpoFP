import { autorun } from "mobx";
import FloorPlanReady from "../floorplan.ready";
import { Drawer, DrawerUpdatables } from "./DrawerInterfaces";
import DrawerImpl from "./impl/DrawerImpl";
import Matrix from "./Matrix";
import { loadJson } from "../tools/loaders";

export default class DrawerAdapter {
    private impl: Drawer;
    private readonly disposers: (() => void)[] = [];
    public readonly drawn: Promise<void>;
    private disposed: boolean;

    constructor(private fp: FloorPlanReady, canvas: HTMLCanvasElement, private m: Matrix) {
        // this.impl = new DrawerImpl(canvas, m.pixelRatio, this.getUpdatables(), this.createLayers(), fp.svg);

        this.drawn = new Promise(async resolve => {
            const meshUrl = fp.dataUrl + "fp.mesh.json";
            this.impl = await createDrawerImpl(canvas, m.pixelRatio, fp.svg, meshUrl);
            if (this.disposed) this.impl.dispose();
            else {
                this.disposers.push(
                    autorun(() => {
                        if (!this.disposed) this.impl.setUpdatables(this.getUpdatables());
                    })
                );
                resolve();
            }
        });
    }

    // private createLayers(): DrawerLayer[] {
    //     // const bgElements = select(this.fp.svg.svgElement)
    //     //     .select("#BG")
    //     //     .selectAll("path, rect")
    //     //     .nodes() as SVGElement[];

    //     // for (const el of bgElements) {
    //     //     if (el.tagName === "path") {
    //     //         addPath(el as SVGPathElement);
    //     //     } else if (el.tagName === "rect") {
    //     //         addRect(el as SVGRectElement);
    //     //     }
    //     // }

    //     return [];
    // }

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
        this.disposed = true;
        this.disposers.forEach(x => x());
        if (this.impl) this.impl.dispose();
    }
}

async function createDrawerImpl(canvas: HTMLCanvasElement, pixelRatio: number, svg: SvgJson, meshUrl: string) {
    // load meshes json
    const mesh = await loadJson<SvgMeshJson>(meshUrl);

    return new DrawerImpl(canvas, pixelRatio, svg, mesh);
}
