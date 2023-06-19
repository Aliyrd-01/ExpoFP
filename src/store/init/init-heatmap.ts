import RootStore from "../RootStore";
import { Heatmap } from "../HeatmapStore";

export function initHeatmap(store: RootStore) {
    store.heatmapStore.heatmapData = window["__heatmapData"] as Heatmap[];
}
