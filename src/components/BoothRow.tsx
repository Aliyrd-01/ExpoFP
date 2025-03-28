import { useObserver } from "mobx-react-lite";
import React from "react";
import data from "../data";
import store, { uiState } from "../store";
import { Booth, SpecialBooth } from "../store/BoothStore";
import SimpleRow from "./SimpleRow";
import useHeatmapData from "../utils/useHeatmapData";

const BoothRow: React.FC<{
    booth: Booth;
    className: string;
}> = ({ booth, className }) => {
    const { clicks, background } = useHeatmapData(booth);

    return useObserver(() => {
        return (
            <SimpleRow
                style={{
                    background: uiState.heatmap
                        ? `linear-gradient(to right, transparent 98%, ${background} 93%) center / 100% 99% no-repeat`
                        : null,
                }}
                className={className}
                slug={booth.slug}
                onClick={handleClick}
                onMouseOut={handleMouseOut}
                onMouseOver={handleMouseOver}
                line1={booth.name.startsWith("yah") ? booth.title : booth.fullName}
                line2={booth instanceof SpecialBooth ? "" : data.boothTerm}
                lineEnd={uiState.heatmap ? clicks.toString() : null}
            />
        );
    });

    function handleClick() {
        store.clickBoothInList2(booth);
    }

    function handleMouseOver() {
        uiState.hoveredBooth = booth;
    }

    function handleMouseOut() {
        uiState.hoveredBooth = null;
    }
};

export default BoothRow;
