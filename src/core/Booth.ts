import { computed, observable } from "mobx";
import Rect from "./Rect";
import { Exhibitor } from "../store/ExhibitorStore";

// TODO: remove Exhibitor from here, or make it part of core

export interface BoothStateProvider {
    listBoothNames: Set<string>;
    hoveredBoothNames: Set<string>;
    selectedBoothNames: Set<string>;
    bookmarkedBoothNames: Set<string>;
    exhibitorIdsByBoothNameMap: Map<string, number[]>;
    exhibitorByIdMap?: Map<number, Exhibitor>;
}

export abstract class BoothBase {
    @observable state: BoothStateProvider;

    readonly id: number;
    readonly name: string;
    readonly title: string;
    readonly rect: Rect;
    readonly noLabels: boolean;
    readonly rotate: number;
    readonly paths: SvgPathShape[];
    readonly pathsWithRect: boolean;
    readonly slug: string;
    readonly error: boolean;
    readonly description: string;

    @computed({ keepAlive: true }) private get inList() {
        return this.state.listBoothNames.has(this.name);
    }

    @computed({ keepAlive: true }) get hover() {
        return this.state.hoveredBoothNames.has(this.name);
    }

    @computed({ keepAlive: true }) get selected() {
        return this.state.selectedBoothNames.has(this.name);
    }

    @computed({ keepAlive: true }) get skipDim() {
        return this.inList || this.selected;
    }
}

export type Booth = RegularBooth | SpecialBooth;

export class RegularBooth extends BoothBase implements Omit<RawRegularBooth, "exhibitors"> {
    readonly buyUrl: string;
    readonly reserveUrl: string;
    readonly type: string;
    readonly status: "onhold" | "reserved";
    readonly price: string;
    readonly special: undefined;

    // populated in init
    readonly size: string; // comes from svg or data.js
    readonly availColor: string; // comes from svg or data.js
    readonly soldColor: string; // comes from svg or data.js
    readonly holdColor: string; // comes from svg or data.js

    @computed({ keepAlive: true }) get onHold() {
        return this.status === "onhold";
    }

    @computed({ keepAlive: true }) get reserved() {
        return this.status === "reserved";
    }

    @computed({ keepAlive: true }) get exhibitorIds(): number[] {
        return this.state.exhibitorIdsByBoothNameMap.get(this.name) || [];
    }

    @computed({ keepAlive: true }) get exhibitors(): Exhibitor[] {
        return this.exhibitorIds.map(x => this.state.exhibitorByIdMap.get(x));
    }

    @computed({ keepAlive: true }) get bookmarked() {
        return this.state.bookmarkedBoothNames.has(this.name);
    }
}

export class SpecialBooth extends BoothBase implements RawSpecialBooth {
    readonly title: string;
    readonly color: string;
    readonly special = true;
}
