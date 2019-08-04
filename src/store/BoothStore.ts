// import { observable } from 'mobx';
import RootStore from "./RootStore";
import { Exhibitor } from "./ExhibitorStore";
import Rect from "../core/Rect";
import { computed } from "mobx";

export default class BoothStore {
    private readonly rootStore: RootStore;
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
}

export class SpecialBooth extends BoothBase implements Omit<RawSpecialBooth, "special">  {
    readonly title: string;
    readonly description: string;
    readonly color: string; // comes from svg or data.js
}
