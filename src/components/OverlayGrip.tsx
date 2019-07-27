import React, { ReactNode, MouseEvent } from "react";
import "./OverlayGrip.scss";
import { observer } from "mobx-react-lite";
import store from "../store";
import classNames from "classnames";

function OverlayGrip() {
    function classes() {
        return classNames({
            "overlay-grip": true,
            arr: store.uiState.overlaySize === "full"
        });
    }

    function handleClick(e: MouseEvent) {
        e.preventDefault();
        store.uiState.toggleMapOverlay();
    }

    return (
        <a href="" className={classes()} onClick={handleClick}>
            <svg viewBox="0 0 1200 200" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
                <path d="M100,100 l 500 100 L 1100 100" />
                <path d="M100,150 l 500 0 L 1100 150" />
            </svg>
        </a>
    );
}

export default observer(OverlayGrip);
