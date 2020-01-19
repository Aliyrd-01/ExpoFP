import React from "react";
import data from "../data";
import { Booth } from "../store/BoothStore";
import { useStore, useUiState } from "../tools/use";
// import store, { uiState } from "../store";
import "./BoothRow.scss";
import SimpleRow from "./SimpleRow";

const BoothRow: React.FC<{
    booth: Booth;
    className: string;
}> = ({ booth, className }) => {
    const store = useStore();
    const uiState = useUiState();

    return (
        <SimpleRow
            className={className}
            slug={booth.slug}
            onClick={handleClick}
            onMouseOut={handleMouseOut}
            onMouseOver={handleMouseOver}
            line1={booth.name}
            line2={data.boothTerm}
        />
    );
    function handleClick() {
        store.clickBoothInList(booth);
    }

    function handleMouseOver() {
        uiState.hoveredBooth = booth;
    }

    function handleMouseOut() {
        uiState.hoveredBooth = null;
    }
};

export default BoothRow;
