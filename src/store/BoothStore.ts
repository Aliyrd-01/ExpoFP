// import { observable } from 'mobx';
import { computed } from "mobx";
import Rect from "../core/Rect";
import { Exhibitor } from "./ExhibitorStore";
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
    readonly booths: Booth[] = [];
    @computed({ keepAlive: true }) get boothById() {
        return new Map<number, Booth>(this.booths.map(c => [c.id, c]));
    }

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }
}

export abstract class BoothBase {
    protected readonly store: BoothStore;
    readonly id: number;
    readonly name: string;
    readonly title: string;
    readonly rect: Rect;
    readonly noLabels: boolean;
    readonly rotate: number;
    readonly paths: PathInfo[];
    readonly slug: string;
    readonly error: boolean;

    @computed({ keepAlive: true }) private get uiState() {
        return this.store.rootStore.uiState;
    }

    @computed({ keepAlive: true }) private get inList() {
        return this.uiState.listBooths.has((this as unknown) as Booth);
    }

    @computed({ keepAlive: true }) get hover() {
        return this.uiState.hoveredBooths.has((this as unknown) as Booth);
    }

    @computed({ keepAlive: true }) get selected() {
        return this.uiState.selectedBooths.has((this as unknown) as Booth);
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
    readonly onHold: boolean;

    // populated
    readonly size: string; // comes from svg or data.js
    readonly price: string; // comes from svg or data.js
    readonly availColor: string; // comes from svg or data.js
    readonly soldColor: string; // comes from svg or data.js

    readonly exhibitors: Exhibitor[];

    @computed({ keepAlive: true }) get empty() {
        return this.exhibitors.length === 0;
    }

    @computed({ keepAlive: true }) get bookmarked() {
        return !this.exhibitors.find(x => x.bookmarked);
    }
}

export class SpecialBooth extends BoothBase implements Omit<RawSpecialBooth, "special"> {
    readonly title: string;
    readonly description: string;
    readonly color: string; // comes from svg or data.js
}
