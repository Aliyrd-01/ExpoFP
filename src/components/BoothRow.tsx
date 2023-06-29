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
    const clicks = heatmapStore.getClicksByItem(booth);
    const background = heatmapStore.getColorFromClickCount(clicks);

    return (
        <SimpleRow
            style={{ background: uiState.heatmap ? `linear-gradient(to right, transparent 98%, ${background} 93%)` : null }}
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
