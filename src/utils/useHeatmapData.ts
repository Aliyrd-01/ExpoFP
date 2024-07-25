import { useMemo } from "react";
import store from "../store";

type TypeUseHeatmapData = (item: { id: string | number }, type: "booth" | "exhibitor" | "yah") => { background: string; clicks: number }

const useHeatmapData: TypeUseHeatmapData = (item, type) => {
    const clicks = useMemo(() => store.heatmapStore.getClicksByItem(item, type), [item, type]);
    const background = useMemo(() => store.heatmapStore.getColorByClicks(clicks), [clicks]);
    return { clicks, background };
};

export default useHeatmapData;