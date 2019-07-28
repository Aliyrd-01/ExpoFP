// import { observable } from 'mobx';
import RootStore from "./RootStore";
import { Exhibitor } from "./ExhibitorStore";
import Rect from "../core/Rect";

export default class BoothStore {
    private readonly rootStore: RootStore;
    readonly booths: (RegularBooth | SpecialBooth)[] = [];

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }
}

abstract class BoothBase {
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