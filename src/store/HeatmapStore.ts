import RootStore from "./RootStore";
import { computed } from "mobx";
import { recordClick } from "../tools/firebase";
import settings from "../tools/settings";
import { Exhibitor } from "./ExhibitorStore";
import { BoothBase } from "./BoothStore";
import { Category } from "./CategoryStore";

const COLOR_THRESHOLDS = {
    high: { limit: 30, color: "#DC143C" },
    medium: { limit: 15, color: "#939C0E" },
    low: { limit: 5, color: "#116B16" },
    default: { color: "#786e6e" },
};

export default class HeatmapStore {
    private readonly rootStore: RootStore;
    heatmapData: HeatmapData = {
        booths: [],
        exhibitors: [],
    };

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    @computed get getClickCount() {
        if (this.rootStore.uiState.clickedBooth) {
            return this.heatmapData.booths.find((data) => this.rootStore.uiState.clickedBooth.id === data.id)?.clickCount || 0;
        }
        if (this.rootStore.uiState.clickedExhibitor) {
            return (
                this.heatmapData.exhibitors.find((data) => this.rootStore.uiState.clickedExhibitor.id === data.id)?.clickCount ||
                0
            );
        }

        return 0;
    }

    async recordUserClickBooth(boothId: number) {
        await recordClick(settings.EXPO, boothId, "booths");
    }

    async recordUserClickExhibitor(exhibitorId: number) {
        await recordClick(settings.EXPO, exhibitorId, "exhibitors");
    }

    getClicksByType(item: Exhibitor | BoothBase | Category) {
        if (item instanceof Category) {
            // -1 is returned for Categories to ensure they appear last in sorted methods
            return -1;
        } else if (item instanceof Exhibitor) {
            return this.getClicksByItem(item);
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

    getColorFromClickCount(count: number) {
        if (count > COLOR_THRESHOLDS.high.limit) {
            return COLOR_THRESHOLDS.high.color;
        } else if (count > COLOR_THRESHOLDS.medium.limit) {
            return COLOR_THRESHOLDS.medium.color;
        } else if (count > COLOR_THRESHOLDS.low.limit) {
            return COLOR_THRESHOLDS.low.color;
        } else {
            return COLOR_THRESHOLDS.default.color;
        }
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
