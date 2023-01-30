import { useLocalStore } from "mobx-react-lite";
import React from "react";
import { uiState } from "../../store";
import "./MapLoader.scss";

export function MapLoader() {
    const ls = useLocalStore(() => ({
        get style() {
            return {
                left: uiState.overlayPosition !== "left" || uiState.kiosk ? 0 : uiState.mapVisibleLeft + "px",
            };
        },
    }));

    return (
        <div className="map-loader" style={ls.style}>
            <div className="lds-grid">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    );
}
