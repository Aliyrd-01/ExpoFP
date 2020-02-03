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

    constructor(private fp: FloorPlanReady, canvas: HTMLCanvasElement, private m: Matrix) {
        // this.impl = new DrawerImpl(canvas, m.pixelRatio, this.getUpdatables(), this.createLayers(), fp.svg);

        this.disposers.push(
            autorun(() => {
                if (this.impl) this.impl.setUpdatables(this.getUpdatables());
            })
        );

        // (async function() {
        //     const fpMeshUrl =

        // })().then();
        this.drawn = new Promise(async resolve => {
            const meshUrl = fp.dataUrl + "fp.mesh.json";
            this.impl = await createDrawerImpl(canvas, m.pixelRatio, this.getUpdatables(), fp.svg, meshUrl);
            resolve();
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
        this.disposers.forEach(x => x());
        this.impl.dispose();
    }
}

async function createDrawerImpl(
    canvas: HTMLCanvasElement,
    pixelRatio: number,
    updatables: DrawerUpdatables,
    svg: SvgJson,
    meshUrl: string
) {
    // load meshes json
    const mesh = await loadJson<SvgMeshJson>(meshUrl);

    return new DrawerImpl(canvas, pixelRatio, updatables, svg, mesh);
}
