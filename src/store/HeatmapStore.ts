import RootStore from "./RootStore";
import { action, computed } from "mobx";
import { recordClick } from "../tools/firebase";
import settings from "../tools/settings";
import { heatmapStore } from "./index";

export default class HeatmapStore {
    private readonly rootStore: RootStore;
    heatmapData: HeatmapData = {
        booths: [],
        exhibitors: [],
    };

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    @action async recordUserClickBooth(boothId: number) {
        await recordClick(settings.EXPO, boothId, "booths");
    }

    @action async recordUserClickExhibitor(exhibitorId: number) {
        await recordClick(settings.EXPO, exhibitorId, "exhibitors");
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
