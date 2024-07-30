import React, { useMemo } from "react";
import { uiState } from "../store";
import useHeatmapData from "./useHeatmapData";
import { Exhibitor } from "../store/ExhibitorStore";
import { BoothBase } from "../store/BoothStore";
import { HeatmapYah } from "../store/HeatmapStore";

const useHeatmapOverlay = (entity: Exhibitor | BoothBase | HeatmapYah, color: string = "#555") => {
    const { clicks, background } = useHeatmapData(entity);

    const heatmapBar = useMemo(() => {
        return uiState.heatmap ? (
            <div style={{ fontWeight: 700, fontSize: "0.9rem", color }}>
                {clicks}
            </div>
    ) : null;
    }, [clicks, color]);

    const overlayBarStyle = useMemo(() => {
        return uiState.heatmap
            ? {
                background: `linear-gradient(to right, transparent 98%, ${background} 93%) center / 100% 99% no-repeat`,
                paddingInlineEnd: "1rem",
            }
            : undefined;
    }, [background]);

    return { heatmapBar, overlayBarStyle };
};

export default useHeatmapOverlay;