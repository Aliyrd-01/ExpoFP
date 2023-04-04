import { lineLength, lineRectangleIntersections, pointInsideRectangle, Rect as Rectangle } from "simple-geometry";
// import { observable } from 'mobx';
import { computed, observable } from "mobx";
import Rect from "../core/Rect";
import settings from "../tools/settings";
import { Exhibitor } from "./ExhibitorStore";
import { Layer } from "./LayerStore";
import RootStore from "./RootStore";
import data from "../data";

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
        if (settings.boothBorderWidth) return settings.boothBorderWidth;
        if (settings.EXPO === "groomexpo") return 0.4;
        const ar = this.booths.filter((b) => b.rect).map((x) => x.rect.w + x.rect.h);
        return ar.reduce((a, b) => a + b, 0) / ar.length / 80;
    }

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    public getNearestBooth(point: Point): Booth {
        var booth: Booth = null;

        const booths = this.booths.map((b) => {
            const { x1, x2, y1, y2 } = b.rect;
            const w = Math.abs(x2 - x1);
            const h = Math.abs(y2 - y1);
            return {
                lineLength: lineLength(
                    point,
                    lineRectangleIntersections(
                        { p0: point, p1: { x: b.rect.cx, y: b.rect.cy } },
                        new Rectangle({ x: x1, y: y1 }, { x: x1 + w, y: y1 }, { x: x1 + w, y: y1 + h }, { x: x1, y: y1 + h })
                    )[0]
                ),
                name: b.name,
            };
        });

        const nearest = booths.sort((b1, b2) => b1.lineLength - b2.lineLength)[0];

        booth = this.booths.find((b) => b.name === nearest.name);

        return booth;
    }

    public getBoothAtPoint(point: Point): Booth {
        return this.booths.find((b) => {
            const { x1, x2, y1, y2 } = b.rect;
            const w = Math.abs(x2 - x1);
            const h = Math.abs(y2 - y1);
            const r = new Rectangle({ x: x1, y: y1 }, { x: x1 + w, y: y1 }, { x: x1 + w, y: y1 + h }, { x: x1, y: y1 + h });
            return pointInsideRectangle(point, r);
        });
    }
}

export abstract class BoothBase {
    protected readonly store: BoothStore;
    readonly id: number;
    readonly name: string;

    readonly externalId: string;
    readonly title: string;
    readonly rect: Rect;
    readonly borderWidth: number;
    readonly borderColor: string;
    noLabels: boolean;
    readonly rotate: number;
    readonly paths: PathInfo[];
    readonly pathsWithRect: boolean;
    readonly slug: string;
    readonly error: boolean;
    readonly description: string;
    @observable layer: Layer;

    @computed({ keepAlive: true }) private get uiState() {
        return this.store.rootStore.uiState;
    }

    @computed({ keepAlive: true }) public get fullName() {
        if (this.layer) return (this.title || this.name) + ` ${data.levelTerm} ` + this.layer.description;
        return this.title || this.name;
    }

    @computed({ keepAlive: true }) get visible() {
        return this.layer?.visible ?? true;
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
        const { selectedRoute } = this.uiState;

        if (selectedRoute?.from?.id !== this.id && selectedRoute?.to?.id !== this.id) {
            return false;
        }

        return (
            this.inList ||
            this.selected ||
            this.store.rootStore.routeStore.defaultFrom?.id === this.id ||
            (this.uiState.list.type === "search" && this.uiState.list.text.trim().length === 0)
        );
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
