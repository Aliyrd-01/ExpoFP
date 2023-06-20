import RootStore from "./RootStore";
import { action, computed } from "mobx";
import { recordClick } from "../tools/firebase";
import settings from "../tools/settings";

export default class HeatmapStore {
    private readonly rootStore: RootStore;
    heatmapData: Heatmap[] = [];

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    @action async recordUserClick(boothId: number) {
        await recordClick(settings.EXPO, boothId);
    }

    @computed get getClickCount() {
        return this.heatmapData.find((data) => this.rootStore.uiState.clickedBooth?.id === data.boothId)?.clickCount || 0;
    }
}

export interface Heatmap {
    boothId: number;
    clickCount: number;
}
