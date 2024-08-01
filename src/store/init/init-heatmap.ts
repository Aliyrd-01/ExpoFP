import RootStore from "../RootStore";
import { HeatmapData } from "../HeatmapStore";

export function initHeatmap(store: RootStore) {
    store.heatmapStore.heatmapData = window["__heatmapData"] as HeatmapData;
}
