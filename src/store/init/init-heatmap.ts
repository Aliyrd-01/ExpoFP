import RootStore from "../RootStore";
import { HeatmapData } from "../HeatmapStore";
import { createCurrentCanvas, getBase64CanvasImage } from "../../components/Map/drawing/config/canvases";

export function initHeatmap(store: RootStore) {
    if (window["__heatmapData"]) {
        store.heatmapStore.heatmapData = window["__heatmapData"] as HeatmapData;
    } else if (window["__heatmapDataYah"]) {
        store.heatmapStore.heatmapData = window["__heatmapDataYah"] as HeatmapData;
        store.routeStore.markersData.icons = store.heatmapStore.heatmapData.yah.map(yah => {
            const color = store.heatmapStore.getColorByClicks(yah.viewCount);
            const canvas = createCurrentCanvas(1, color, 95, 110, yah.viewCount.toString());
            const base64 = getBase64CanvasImage(canvas);
            return {
                name: yah.id.toString(),
                width: canvas.width,
                height: canvas.height,
                content: base64
            }
        });
        store.routeStore.markersData.markers = store.heatmapStore.heatmapData.yah.map(yah => {
            return {
                id: yah.id.toString(),
                x: yah.x,
                y: yah.y,
                z: yah.z,
                icon: yah.id.toString(),
                selectedIcon: yah.id.toString(),
            }
        })
    }
}
