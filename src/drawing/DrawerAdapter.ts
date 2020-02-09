import { autorun, computed, toJS } from "mobx";
import { Booth, RegularBooth } from "../core/Booth";
import FloorPlanReady from "../floorplan.ready";
import ExhibitorStore from "../store/ExhibitorStore";
import UIState from "../store/UIState";
import DrawerImplProxy from "./DrawerImplProxy";
import { BoothStateSeriazable as BoothStateSerializable, DrawerConfig, DrawerUpdatables } from "./DrawerInterfaces";
import Matrix from "./Matrix";

export default class DrawerAdapter {
    private impl: DrawerImplProxy;
    private readonly disposers: (() => void)[] = [];
    public readonly drawn: Promise<void>;
    private disposed: boolean;
    private boothState: BoothStateSerializable;

    constructor(private fp: FloorPlanReady, canvas: HTMLCanvasElement, private m: Matrix) {
        this.boothState = new BoothStateSeriazableComputed(fp.store.uiState, fp.store.exhibitorStore);

        const config: DrawerConfig = {
            canvas,
            pixelRatio: m.pixelRatio,
            borderWidth: this.fp.store.boothStore.borderWidth,
            svg: fp.svg,
            meshUrl: fp.meshUrl,
            booths: this.getBooths(),
            exhibitorNames: this.fp.store.exhibitorStore.exhibitors.reduce((map, x) => {
                map[x.id] = x.name;
                return map;
            }, {} as Record<number, string>),
            __efpDebug
        };

        this.impl = new DrawerImplProxy(config);
        this.drawn = this.impl.drawn;

        this.disposers.push(
            autorun(() => {
                if (!this.disposed) this.setUpdatables();
            })
        );
    }

    private getBooths(): any[] {
        return this.fp.store.boothStore.booths.map(x => {
            const json = JSON.stringify(x);
            const obj = JSON.parse(json);
            if (x instanceof RegularBooth) {
                obj.exhibitorIds = toJS(x.exhibitorIds);
            }
            delete obj.state;
            return obj;
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

        // const r = {};
        // const p = this.previousUpdatables;

        // function setVal(key: keyof DrawerUpdatables, val: any) {
        //     if (!p || val !== p[key]) {
        //         r[key] = val;
        //     }
        // }
        // setVal("matrix", this.m.matrix);
        // setVal("ptscale", this.m.ptscale);
        // setVal("canvasVisibleRectPt", uiState.canvasVisibleRectPt);
        // setVal("canvasSizePt", uiState.canvasSizePt);
        // setVal("dimmed", uiState.dimmed);
        // setVal("listBoothNames", bs.listBoothNames);
        // setVal("hoveredBoothNames", bs.hoveredBoothNames);
        // setVal("selectedBoothNames", bs.selectedBoothNames);
        // setVal("bookmarkedBoothNames", bs.bookmarkedBoothNames);
        // setVal("exhibitorIdsByBoothNameMap", bs.exhibitorIdsByBoothNameMap);

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

        this.impl.setUpdatables(res);
    }

    dispose() {
        this.disposed = true;
        this.disposers.forEach(x => x());
        if (this.impl) this.impl.dispose();
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
