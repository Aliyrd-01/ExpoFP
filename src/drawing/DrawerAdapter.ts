import { autorun, computed } from "mobx";
import { Booth, RegularBooth, SpecialBooth } from "../core/Booth";
import Rect from "../core/Rect";
import FloorPlanReady from "../floorplan.ready";
import ExhibitorStore from "../store/ExhibitorStore";
import UIState from "../store/UIState";
import { loadJson } from "../tools/loaders";
import { BoothStateSeriazable as BoothStateSerializable, Drawer, DrawerConfig, DrawerUpdatables } from "./DrawerInterfaces";
import DrawerImpl from "./impl/DrawerImpl";
import Matrix from "./Matrix";

export default class DrawerAdapter {
    private impl: Drawer;
    private readonly disposers: (() => void)[] = [];
    public readonly drawn: Promise<void>;
    private disposed: boolean;
    private boothState: BoothStateSerializable;

    constructor(private fp: FloorPlanReady, canvas: HTMLCanvasElement, private m: Matrix) {
        // this.impl = new DrawerImpl(canvas, m.pixelRatio, this.getUpdatables(), this.createLayers(), fp.svg);
        this.boothState = new BoothStateSeriazableComputed(fp.store.uiState, fp.store.exhibitorStore);

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
                        if (!this.disposed) this.setUpdatables(); // this.impl.setUpdatables(this.getUpdatables());
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
        return this.fp.store.boothStore.booths.map(x => {
            const json = JSON.stringify(x);
            const obj = JSON.parse(json);
            let booth: Booth;
            if (obj.special) {
                booth = new SpecialBooth();
            } else {
                booth = new RegularBooth();
            }

            Object.assign(booth, obj);
            Object.setPrototypeOf(booth.rect, Rect.prototype);

            // const booth = Object.setPrototypeOf(obj, obj.special ? SpecialBooth.prototype : RegularBooth.prototype) as Booth;
            // Object.setPrototypeOf(booth.rect, Rect.prototype);
            // booth.state = x.state;

            // console.log("b", booth.state, x.state);
            // debugger;
            // if (booth instanceof RegularBooth) {
            //     console.log("bbb", booth.state, x.state);
            //     console.log(booth.exhibitorIds);
            // }

            return booth;
        });
    }

    private previousUpdatables: DrawerUpdatables;

    private setUpdatables() {
        const { uiState } = this.fp.store;
        const bs = this.boothState;
        const res: DrawerUpdatables = {
            matrix: this.m.matrix,
            ptscale: this.m.ptscale,
            canvasVisibleRectPt: uiState.canvasVisibleRectPt,
            canvasSizePt: uiState.canvasSizePt,
            dimmed: uiState.dimmed,
            listBoothNames: bs.listBoothNames,
            hoveredBoothNames: bs.hoveredBoothNames,
            selectedBoothNames: bs.selectedBoothNames,
            bookmarkedBoothNames: bs.bookmarkedBoothNames,
            exhibitorIdsByBoothNameMap: bs.exhibitorIdsByBoothNameMap
        };

        // debugger;
        // delete same
        if (this.previousUpdatables) {
            for (const key of Object.keys(res)) {
                if (this.previousUpdatables[key] === res[key]) {
                    delete res[key];
                }
            }
            Object.assign(this.previousUpdatables, res);
        } else {
            this.previousUpdatables = { ...res };
        }

        // logger.log("Setting updatables", Object.keys(res), res);

        this.impl.setUpdatables(res);

        return res;
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

class BoothStateSeriazableComputed implements BoothStateSerializable {
    constructor(private uiState: UIState, private exhibitorStore: ExhibitorStore) {}
    @computed({ keepAlive: true }) get listBoothNames() {
        return boothSetToNames(this.uiState.listBooths);
    }
    @computed({ keepAlive: true }) get hoveredBoothNames() {
        return boothSetToNames(this.uiState.hoveredBooths);
    }
    @computed({ keepAlive: true }) get selectedBoothNames() {
        return boothSetToNames(this.uiState.selectedBooths);
    }
    @computed({ keepAlive: true }) get bookmarkedBoothNames() {
        return Array.from(this.exhibitorStore.bookmarkedBoothNames);
    }
    @computed({ keepAlive: true }) get exhibitorIdsByBoothNameMap() {
        return Array.from(this.exhibitorStore.exhibitorIdsByBoothNameMap);
    }
    // @computed({ keepAlive: true }) get exhibitorByIdMap() {
    //     return this.exhibitorStore.exhibitorByIdMap;
    // }
}

function boothSetToNames(set: Set<Booth>) {
    return Array.from(set).map(x => x.name);
}
