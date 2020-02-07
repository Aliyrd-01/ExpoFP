import { autorun, computed, toJS } from "mobx";
import { Booth } from "../core/Booth";
import FloorPlanReady from "../floorplan.ready";
import ExhibitorStore from "../store/ExhibitorStore";
import UIState from "../store/UIState";
// import PseudoWorker from "./PseudoWorker";
import {
    BoothStateSeriazable as BoothStateSerializable,
    Drawer,
    DrawerConfig,
    DrawerUpdatables,
    DrawerWorkerMessage
} from "./DrawerInterfaces";
import Matrix from "./Matrix";

export default class DrawerAdapter {
    private impl: DrawerImplProxy;
    private readonly disposers: (() => void)[] = [];
    public readonly drawn: Promise<void>;
    private disposed: boolean;
    private boothState: BoothStateSerializable;

    constructor(private fp: FloorPlanReady, canvas: HTMLCanvasElement, private m: Matrix) {
        // this.impl = new DrawerImpl(canvas, m.pixelRatio, this.getUpdatables(), this.createLayers(), fp.svg);
        this.boothState = new BoothStateSeriazableComputed(fp.store.uiState, fp.store.exhibitorStore);

        this.impl = new DrawerImplProxy(canvas, m.pixelRatio, this.getDrawerConfig(), fp.svg, fp.meshUrl, this.getBooths());
        this.drawn = this.impl.drawn;
        // if (this.disposed) this.impl.dispose();
        // else {
        this.disposers.push(
            autorun(() => {
                if (!this.disposed) this.setUpdatables();
            })
        );
        // }
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

    private getBooths(): any[] {
        return this.fp.store.boothStore.booths.map(x => {
            const json = JSON.stringify(x);
            const obj = JSON.parse(json);
            delete obj.state;
            return obj;
            // let booth: Booth;
            // if (obj.special) {
            //     booth = new SpecialBooth();
            // } else {
            //     booth = new RegularBooth();
            // }

            // Object.assign(booth, obj);
            // Object.setPrototypeOf(booth.rect, Rect.prototype);

            // // const booth = Object.setPrototypeOf(obj, obj.special ? SpecialBooth.prototype : RegularBooth.prototype) as Booth;
            // // Object.setPrototypeOf(booth.rect, Rect.prototype);
            // // booth.state = x.state;

            // // console.log("b", booth.state, x.state);
            // // debugger;
            // // if (booth instanceof RegularBooth) {
            // //     console.log("bbb", booth.state, x.state);
            // //     console.log(booth.exhibitorIds);
            // // }

            // return booth;
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

        // return res;
    }

    dispose() {
        this.disposed = true;
        this.disposers.forEach(x => x());
        if (this.impl) this.impl.dispose();
    }
}

// async function createDrawerImpl(
//     canvas: HTMLCanvasElement,
//     pixelRatio: number,
//     config: DrawerConfig,
//     svg: SvgJson,
//     meshUrl: string,
//     booths: Booth[]
// ) {
//     const w = new Worker("drawer.js");
//     w.postMessage("message1");
//     // load meshes json
//     // const mesh = await loadJson<SvgMeshJson>(meshUrl);

//     // return new DrawerImpl(canvas, pixelRatio, config, svg, mesh, booths);
// }

let worker = new Worker("drawer.js");
worker.onmessage = ev => proxies.forEach(p => p.onmessage(ev));
const proxies = new Set<DrawerImplProxy>();
let idSeq = 0;

class DrawerImplProxy implements Drawer {
    private id = idSeq++;
    private drawnResolve: () => void;
    private created: boolean;
    public readonly drawn: Promise<void>;
    public readonly updatablesQueue: DrawerUpdatables[] = [];

    constructor(
        canvas: HTMLCanvasElement,
        pixelRatio: number,
        config: DrawerConfig,
        svg: SvgJson,
        meshUrl: string,
        booths: Booth[]
    ) {
        this.drawn = new Promise(r => (this.drawnResolve = r));

        const workerCanvas = canvas.transferControlToOffscreen();
        this.postMessage(
            {
                type: "create",
                id: this.id,
                params: [workerCanvas, pixelRatio, config, svg, meshUrl, booths] as any
            },
            [(workerCanvas as any) as Transferable]
        );
        proxies.add(this);
    }
    onmessage(ev: MessageEvent) {
        if (ev.data.id !== this.id) return;
        if (ev.data.type === "created") {
            this.created = true;
            this.setUpdatables();
        }
        if (ev.data.type === "drawn") this.drawnResolve();
    }
    async postMessage(message: DrawerWorkerMessage, transfer?: Transferable[]) {
        // if (!worker) {
        //     // const WorkerConstructor = PseudoWorker as any;
        //     worker = new Worker("drawer.js");
        //     worker.onmessage = ev => proxies.forEach(p => p.onmessage(ev));
        // }
        // console.log("posting message", message.type, message);
        worker.postMessage(message, transfer);
    }
    setUpdatables(u?: DrawerUpdatables) {
        if (u) this.updatablesQueue.push(u);
        if (!this.created) return;
        for (const u2 of this.updatablesQueue) {
            this.postMessage({
                type: "setUpdatables",
                id: this.id,
                params: [u2]
            });
        }
        this.updatablesQueue.length = 0;
    }
    dispose() {
        this.postMessage({
            type: "dispose",
            id: this.id
        });
        proxies.delete(this);
    }
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
        return Array.from(this.exhibitorStore.exhibitorIdsByBoothNameMap).map(k => [k[0], toJS(k[1])] as [string, number[]]);
    }
    // @computed({ keepAlive: true }) get exhibitorByIdMap() {
    //     return this.exhibitorStore.exhibitorByIdMap;
    // }
}

function boothSetToNames(set: Set<Booth>) {
    return Array.from(set).map(x => x.name);
}
