import { useObserver } from "mobx-react-lite";
import React from "react";
import { layersStore, uiState } from "../store";
import SimpleRow from "./SimpleRow";
import useHeatmapData from "../utils/useHeatmapData";
import { HeatmapYah } from "../store/HeatmapStore";
import Rect from "../core/Rect";

const YahRow: React.FC<{
    yah: HeatmapYah;
    className: string;
}> = ({ yah, className }) => {
    const { clicks, background } = useHeatmapData(yah);

    return useObserver(() => {
        return (
            <SimpleRow
                style={{
                    background: uiState.heatmapYah
                        ? `linear-gradient(to right, transparent 98%, ${background} 93%) center / 100% 99% no-repeat`
                        : null,
                }}
                className={className}
                slug={yah.id.toString()}
                onClick={handleClick}
                line1={yah.name}
                line2=""
                lineEnd={clicks.toString()}
            />
        );
    });

    function handleClick() {
        const layer = layersStore.findLayer(yah.z);
        if (layer) {
            layersStore.updateVisibility(layer, true);
        }
        uiState.moveToRect = Rect.fromCxcywh(yah.x, yah.y, 1000, 1000);
    }
};

export default YahRow;
