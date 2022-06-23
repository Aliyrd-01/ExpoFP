// import { observable } from 'mobx';
import { computed, observable } from "mobx";
import Rect from "../core/Rect";
import settings from "../tools/settings";
import { Exhibitor } from "./ExhibitorStore";
import { Layer } from "./LayerStore";
import RootStore from "./RootStore";

// interface BoothState {
//     hover: boolean;
//     selected: boolean;
//     skipDim: boolean;
//     error: boolean;
//     empty: boolean;
//     onhold: boolean;
//     bookmarked: boolean;
// }

export default class BoothStore {
    readonly rootStore: RootStore;
    @observable booths: Booth[] = [];

    @computed({ keepAlive: true }) get boothById() {
        return new Map<number, Booth>(this.booths.map((c) => [c.id, c]));
    }

    @computed({ keepAlive: true }) get borderWidth() {
        if (settings.EXPO === "groomexpo") return 0.4;
        const ar = this.booths.map((x) => x.rect.w + x.rect.h);
        return ar.reduce((a, b) => a + b) / ar.length / 80;
    }

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }
}

export abstract class BoothBase {
    protected readonly store: BoothStore;
    readonly id: number;
    readonly name: string;
    readonly fullName: string;
    readonly externalId: string;
    readonly title: string;
    readonly rect: Rect;
    readonly noLabels: boolean;
    readonly rotate: number;
    readonly paths: PathInfo[];
    readonly pathsWithRect: boolean;
    readonly slug: string;
    readonly error: boolean;
    readonly description: string;
    readonly layer: Layer;

    @computed({ keepAlive: true }) private get uiState() {
        return this.store.rootStore.uiState;
    }

    @computed({ keepAlive: true }) get visible() {
        return this.layer?.visible;
    }

    @computed({ keepAlive: true }) private get inList() {
        return this.uiState.listBooths.has(this as unknown as Booth);
    }

    @computed({ keepAlive: true }) get hover() {
        return this.uiState.hoveredBooths.has(this as unknown as Booth);
    }

    @computed({ keepAlive: true }) get selected() {
        return this.uiState.selectedBooths.has(this as unknown as Booth);
    }

    @computed({ keepAlive: true }) get skipDim() {
        return this.inList || this.selected;
    }

    // // skipDim: boolean;
    // empty: boolean;
    // //onhold: boolean;
    // bookmarked: boolean;
}

export type Booth = RegularBooth | SpecialBooth;

export class RegularBooth extends BoothBase implements Omit<RawRegularBooth, "exhibitors"> {
    readonly buyUrl: string;
    readonly reserveUrl: string;
    readonly type: string;
    readonly status: "onhold" | "reserved";
    readonly price: string;
    // readonly onHold: boolean;
    // readonly reserved: boolean;

    // populated
    readonly size: string; // comes from svg or data.js shown when data.dimensionless is true
    readonly availColor: string; // comes from svg or data.js
    readonly soldColor: string; // comes from svg or data.js
    readonly holdColor: string; // comes from svg or data.js
    readonly onHold: boolean; // comes from status
    readonly reserved: boolean; // comes from status

    readonly exhibitors: Exhibitor[];

    @computed({ keepAlive: true }) get bookmarked() {
        return !!this.exhibitors.find((x) => x.bookmarked);
    }

    // @computed({ keepAlive: true }) get reserved() {
    //     return this.exhibitors.length > 0 || this.onHold;
    // }
}

export class SpecialBooth extends BoothBase implements Omit<RawSpecialBooth, "special"> {
    // readonly description: string;
    readonly color: string; // comes from svg or data.js
}
