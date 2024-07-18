import { useMemo } from "react";
import store from "../store";
import { Exhibitor } from "../store/ExhibitorStore";
import { BoothBase } from "../store/BoothStore";

const useHeatmapData = (item: Exhibitor | BoothBase) => {
    const clicks = useMemo(() => store.heatmapStore.getClicksByItem(item), [item]);
    const background = useMemo(() => store.heatmapStore.getColorByClicks(clicks), [clicks]);
    return { clicks, background };
};

export default useHeatmapData;