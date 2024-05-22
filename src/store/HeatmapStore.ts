import RootStore from "./RootStore";
import { recordClick } from "../tools/firebase";
import settings from "../tools/settings";
import { Exhibitor } from "./ExhibitorStore";
import { BoothBase } from "./BoothStore";
import { Category } from "./CategoryStore";
import { getColorFromGradient } from "../tools/Color";
import { ScheduleItem } from "./ScheduleStore";

export default class HeatmapStore {
    private readonly rootStore: RootStore;
    heatmapData: HeatmapData = {
        booths: [],
        exhibitors: [],
    };

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    async recordUserClickBooth(boothId: number) {
        await recordClick(settings.EXPO, boothId, "booths");
    }

    async recordUserClickExhibitor(exhibitorId: number) {
        await recordClick(settings.EXPO, exhibitorId, "exhibitors");
    }

    getClicksByType(item: Exhibitor | BoothBase | Category | ScheduleItem) {
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

    getClicksByItem(item: Exhibitor | BoothBase) {
        if (item instanceof Exhibitor) {
            return this.heatmapData?.exhibitors.find((a) => a.id === item.id)?.clickCount || 0;
        }

        if (item instanceof BoothBase) {
            return this.heatmapData?.booths.find((a) => a.id === item.id)?.clickCount || 0;
        }
    }

    getColorByClicks(item: Exhibitor | BoothBase) {
        const clickCount = this.getClicksByItem(item);
        return this.getColorFromClickCount(clickCount);
    }

    getColorFromClickCount(countClicks: number) {
        return getColorFromGradient(countClicks);
    }
}

export interface HeatmapData {
    booths: HeatmapItem[];
    exhibitors: HeatmapItem[];
}

export interface HeatmapItem {
    id: number;
    clickCount: number;
}
