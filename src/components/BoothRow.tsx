import React from "react";
import { Booth } from "../store/BoothStore";
import SimpleRow from "./SimpleRow";
import data from "../data";
import store, { uiState } from "../store";
import './BoothRow.scss'

const BoothRow: React.FC<{
    booth: Booth;
    className: string;
}> = ({ booth, className}) => {
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
