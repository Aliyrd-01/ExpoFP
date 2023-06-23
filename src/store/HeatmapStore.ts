import RootStore from "./RootStore";
import { computed } from "mobx";
import { recordClick } from "../tools/firebase";
import settings from "../tools/settings";
import { heatmapStore } from "./index";
import { Exhibitor } from "./ExhibitorStore";
import { BoothBase } from "./BoothStore";
import { Category } from "./CategoryStore";

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
            return -1;
        } else if (item instanceof Exhibitor) {
            return this.getExhibitorClicksById(item.id);
        }
        return this.getBoothClicksById(item.id);
    }

    getColorFromClickCount(count: number) {
        if (count > 30) {
            return "#DC143C";
        } else if (count > 15) {
            return "#939C0E";
        } else if (count > 5) {
            return "#116B16";
        } else {
            return "#786e6e";
        }
    }

    getBoothClicksById(id: number) {
        return heatmapStore.heatmapData?.booths.find((ex) => ex.id === id)?.clickCount || 0;
    }

    getExhibitorClicksById(id: number) {
        return heatmapStore.heatmapData?.exhibitors.find((ex) => ex.id === id)?.clickCount || 0;
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
