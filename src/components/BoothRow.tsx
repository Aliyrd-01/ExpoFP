import React from "react";
import data from "../data";
import store, { heatmapStore, uiState } from "../store";
import { Booth, SpecialBooth } from "../store/BoothStore";
import "./BoothRow.scss";
import SimpleRow from "./SimpleRow";

const BoothRow: React.FC<{
    booth: Booth;
    className: string;
}> = ({ booth, className }) => {
    const background = heatmapStore.getColorFromClickCount(heatmapStore.getBoothClicksById(booth.id));

    return (
        <SimpleRow
            style={{ background: uiState.heatmap ? `linear-gradient(to right, transparent 50%, ${background} 100%)` : null }}
            className={className}
            slug={booth.slug}
            onClick={handleClick}
            onMouseOut={handleMouseOut}
            onMouseOver={handleMouseOver}
            line1={booth.name.startsWith("yah") ? booth.title : booth.fullName}
            line2={booth instanceof SpecialBooth ? "" : data.boothTerm}
        />
    );
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
