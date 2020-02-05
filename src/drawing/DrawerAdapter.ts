import { autorun } from "mobx";
import FloorPlanReady from "../floorplan.ready";
import { Drawer, DrawerUpdatables, DrawerConfig } from "./DrawerInterfaces";
import DrawerImpl from "./impl/DrawerImpl";
import Matrix from "./Matrix";
import { loadJson } from "../tools/loaders";
import { Booth } from "../core/Booth";
// import { RegularBooth, SpecialBooth } from "../store/BoothStore";

export default class DrawerAdapter {
    private impl: Drawer;
    private readonly disposers: (() => void)[] = [];
    public readonly drawn: Promise<void>;
    private disposed: boolean;

    constructor(private fp: FloorPlanReady, canvas: HTMLCanvasElement, private m: Matrix) {
        // this.impl = new DrawerImpl(canvas, m.pixelRatio, this.getUpdatables(), this.createLayers(), fp.svg);

        this.drawn = new Promise(async resolve => {
            this.impl = await createDrawerImpl(
                canvas,
                m.pixelRatio,
                this.getDrawerConfig(),
                fp.svg,
                fp.meshUrl,
                this.getBooths()
            );
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
    private getDrawerConfig(): DrawerConfig {
        return {
            borderWidth: this.fp.store.boothStore.borderWidth
        };
    }

    private getBooths(): Booth[] {
        return this.fp.store.boothStore.booths;
        // return this.fp.store.boothStore.booths.map(b => {
        //     const common = {
        //         name: b.name,
        //         rect: b.rect,
        //         noLabels: b.noLabels,
        //         rotate: b.rotate,
        //         paths: b.paths,
        //         pathsWithRect: b.pathsWithRect,
        //         error: b.error
        //     };

        //     if (b instanceof RegularBooth) {
        //         return {
        //             ...common,
        //             exhibitors: [],
        //             size: b.size,
        //             availColor: b.availColor
        //         };
        //     } else if (b instanceof SpecialBooth) {
        //         return {
        //             ...common,
        //             special: true,
        //             color: b.color
        //         };
        //     }
        // });
    }

    private getUpdatables(): DrawerUpdatables {
        const uiState = this.fp.store.uiState;
        return {
            matrix: this.m.matrix,
            ptscale: this.m.ptscale,
            canvasVisibleRectPt: uiState.canvasVisibleRectPt,
            canvasSizePt: uiState.canvasSizePt,
            dimmed: uiState.dimmed,
            // selectedBooths: Array.from(uiState.selectedBooths),
            boothExhibitors: {}
        };
    }

    dispose() {
        this.disposed = true;
        this.disposers.forEach(x => x());
        if (this.impl) this.impl.dispose();
    }
}

async function createDrawerImpl(
    canvas: HTMLCanvasElement,
    pixelRatio: number,
    config: DrawerConfig,
    svg: SvgJson,
    meshUrl: string,
    booths: Booth[]
) {
    // load meshes json
    const mesh = await loadJson<SvgMeshJson>(meshUrl);

    return new DrawerImpl(canvas, pixelRatio, config, svg, mesh, booths);
}
