import RootStore from "./RootStore";
import { Exhibitor } from "./ExhibitorStore";
import { BoothBase } from "./BoothStore";
import { Category } from "./CategoryStore";
import { getColorFromGradient } from "../tools/Color";
import { ScheduleItem } from "./ScheduleStore";
import { computed } from "mobx";
import type { ListItem } from "./types";
import type { GaEventActions } from "../tools/gtag";
export default class HeatmapStore {
    private readonly rootStore: RootStore;
    heatmapData: HeatmapData = {};

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    // don't observe this
    forceTrack: { action: GaEventActions; label: string } | null = null;

    @computed({ keepAlive: true }) get minAndMaxClicks() {
        const { booths = [], exhibitors = [], yah = [] } = this.heatmapData;

        const allItems = [...booths, ...exhibitors, ...yah];
        if (allItems.length === 0) {
            return { min: 0, max: 0 };
        }

        const getMinMax = (data: HeatmapItem[]): { min: number, max: number } => {
            return data.reduce(
                (acc, item) => {
                    if (item.viewCount > acc.max) acc.max = item.viewCount;
                    if (item.viewCount < acc.min) acc.min = item.viewCount;
                    return acc;
                },
                { min: data[0].viewCount, max: data[0].viewCount }
            );
        };

        const { min, max } = getMinMax(allItems);

        return { min, max };
    }

    getClicksByType(item: ListItem) {
        if (item instanceof Category) {
            // -1 is returned for Categories to ensure they appear last in sorted methods
            return -1;
        } else if (item instanceof Exhibitor) {
            return this.getClicksByItem(item);
        } else if (item instanceof HeatmapYah) {
            return this.getClicksByItem(item);
        } else if (item instanceof ScheduleItem) {
            return 0;
        }

        return this.getClicksByItem(item);
    }

    getClicksByItem(item: ListItem | BoothBase) {
        if (item instanceof Exhibitor) {
            return this.heatmapData?.exhibitors?.find((a) => a.id === item.id)?.viewCount || 0;
        }

        if (item instanceof BoothBase) {
            return this.heatmapData?.booths?.find((a) => a.id === item.id)?.viewCount || 0;
        }

        if (item instanceof HeatmapYah) {
            return this.heatmapData?.yah?.find((a) => a.id === item.id)?.viewCount || 0;
        }

        return 0;
    }

    getTotalClicksByBooth(b: BoothBase) {
        let totalClicks = this.getClicksByItem(b);
        for (const exhibitor of b.exhibitors) {
            const clicks = this.getClicksByItem(exhibitor);
            totalClicks += clicks;
        }

        return totalClicks;
    }

    getColorByClicks(clicks: number) {
        const { min, max } = this.minAndMaxClicks;
        return getColorFromGradient(clicks, min, max);
    }
}

export interface HeatmapData {
    booths?: HeatmapItem[];
    exhibitors?: HeatmapItem[];
    yah?: HeatmapYah[];
}

export class HeatmapYah {
    readonly id: number | string;
    readonly name: string;
    readonly viewCount: number;
    readonly x: number;
    readonly y: number;
    readonly z?: number | string;
}

export interface HeatmapItem {
    id: number | string;
    viewCount: number;
}
