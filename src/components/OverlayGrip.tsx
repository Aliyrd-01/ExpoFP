import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { MouseEvent } from "react";
import { uiState } from "../store";
import "./OverlayGrip.scss";

import "./OverlayGrip.scss";

function OverlayGrip() {
    function classes() {
        return classNames({
            "overlay-grip": true,
            arr: uiState.overlaySize === "full",
        });
    }

    function handleClick(e: MouseEvent) {
        e.preventDefault();
        uiState.toggleMapOverlay();
    }

    return (
        <a href="/#" className={classes()} onClick={handleClick}>
            <svg viewBox="0 0 1200 200" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
                <path d="M100,100 l 500 100 L 1100 100" />
                <path d="M100,150 l 500 0 L 1100 150" />
            </svg>
        </a>
    );
}

export default observer(OverlayGrip);
