import RootStore from "./RootStore";
import { action } from "mobx";
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
}

export interface Heatmap {
    boothId: number;
    clickCount: number;
}
