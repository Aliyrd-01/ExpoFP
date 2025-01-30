import RootStore from "./RootStore";
import { Exhibitor } from "./ExhibitorStore";
import { BoothBase } from "./BoothStore";
import { Category } from "./CategoryStore";
import { getColorFromGradient } from "../tools/Color";
import { ScheduleItem } from "./ScheduleStore";
import { action, computed, observable } from "mobx";
import type { ListItem } from "./types";
import type { GaEventActions } from "../tools/gtag";
export default class HeatmapStore {
    private readonly rootStore: RootStore;
    heatmapData: HeatmapData = {
        booths: [],
        exhibitors: [],
    };

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    @observable forceTrack: { action: GaEventActions; label: string } | null = null;

    @action clearForceTrack = () => {
        this.forceTrack = null;
    }

    @computed({ keepAlive: true }) get minAndMaxClicks() {
        if (!this.heatmapData || !this.heatmapData.booths || !this.heatmapData.exhibitors) {
            return { min: 0, max: 0 };
        }
        const getMinMax = (data: HeatmapItem[], field: string) => {
            return data.reduce((acc, obj) => {
                if (obj[field] > acc.max) acc.max = obj[field];
                if (obj[field] < acc.min) acc.min = obj[field];
                return acc;
            }, { min: data[0][field], max: data[0][field] });
        };

        const { min: minClicksBooth, max: maxClicksBooth } = getMinMax(this.heatmapData.booths, 'viewCount');
        const { min: minClicksExhibitor, max: maxClicksExhibitor } = getMinMax(this.heatmapData.exhibitors, 'viewCount');

        return {
            min: Math.min(minClicksBooth, minClicksExhibitor),
            max: Math.max(maxClicksBooth, maxClicksExhibitor)
        };
    }

    getClicksByType(item: ListItem) {
        if (item instanceof Category) {
            // -1 is returned for Categories to ensure they appear last in sorted methods
            return -1;
        } else if (item instanceof Exhibitor) {
            return this.getClicksByItem(item);
        } else if (item instanceof ScheduleItem) {
            return 0;
        }
        return this.getClicksByItem(item);
    }

    getClicksByItem(item: ListItem | BoothBase) {
        if (item instanceof Exhibitor) {
            return this.heatmapData?.exhibitors.find((a) => a.id === item.id)?.viewCount || 0;
        }

        if (item instanceof BoothBase) {
            return this.heatmapData?.booths.find((a) => a.id === item.id)?.viewCount || 0;
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
    booths: HeatmapItem[];
    exhibitors: HeatmapItem[];
}

export interface HeatmapItem {
    id: number;
    viewCount: number;
}
