import { useMemo } from "react";
import store from "../store";
import { BoothBase } from "../store/BoothStore";
import { Exhibitor } from "../store/ExhibitorStore";
import { HeatmapYah } from "../store/HeatmapStore";

type TypeUseHeatmapData = (item: BoothBase | Exhibitor | HeatmapYah) => { background: string; clicks: number }

const useHeatmapData: TypeUseHeatmapData = (item) => {
    const clicks = useMemo(() => store.heatmapStore.getClicksByItem(item), [item]);
    const background = useMemo(() => store.heatmapStore.getColorByClicks(clicks), [clicks]);
    return { clicks, background };
};

export default useHeatmapData;