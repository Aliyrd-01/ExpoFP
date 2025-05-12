import { useMemo } from "react";
import store from "../store";
import { BoothBase } from "../store/BoothStore";
import { Exhibitor } from "../store/ExhibitorStore";
import { HeatmapYah } from "../store/HeatmapStore";

type SupportedItem = BoothBase | Exhibitor | HeatmapYah | undefined;

const useHeatmapData = (item: SupportedItem) => {
    const clicks = useMemo(() => (item ? store.heatmapStore.getClicksByItem(item) : 0), [item]);
    const background = useMemo(() => store.heatmapStore.getColorByClicks(clicks), [clicks]);
    return { clicks, background };
};

export default useHeatmapData;
