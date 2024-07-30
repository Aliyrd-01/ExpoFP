import RootStore from "../RootStore";
import { HeatmapData, HeatmapYah } from "../HeatmapStore";
import { createCurrentCanvas, getBase64CanvasImage } from "../../components/Map/drawing/config/canvases";

export function initHeatmap(store: RootStore) {
    if (window["__heatmapData"]) {
        store.heatmapStore.heatmapData = window["__heatmapData"] as HeatmapData;
    } else if (window["__heatmapDataYah"]) {
        store.heatmapStore.heatmapData.yah = window["__heatmapDataYah"].yah.map(item => {
            const yah = new HeatmapYah() as MutableRequired<HeatmapYah>;
            yah.id = item.id;
            yah.name = item.name;
            yah.viewCount = item.viewCount;
            yah.x = item.x;
            yah.y = item.y;
            yah.z = item.z;
            return yah;
        }) as HeatmapYah[];

        const icons = store.heatmapStore.heatmapData.yah.map(yah => {
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
        const markers = store.heatmapStore.heatmapData.yah.map(yah => {
            return {
                id: yah.id.toString(),
                x: yah.x,
                y: yah.y,
                z: yah.z,
                position: "lefttop" as const,
                icon: yah.id.toString(),
                selectedIcon: yah.id.toString(),
            }
        });

        store.routeStore.setMarkers({ markers, icons });
    }
}