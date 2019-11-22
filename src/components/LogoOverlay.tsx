import { useLocalStore, useObserver } from "mobx-react-lite";
import React from "react";
import { uiState } from "../store";
import { remsToPixels } from "../utils";
import "./LogoOverlay.scss";

export default function LogoOverlay() {
    const s = useLocalStore(() => ({
        get style() {
            const pad = uiState.overlayPosition === "left" ? remsToPixels(1) : remsToPixels(0.5);
            let style: any;
            if (uiState.overlayPosition === "left")
                style = { bottom: uiState.mapVisibleBottom + pad + "px", right: pad + "px", width: "5rem" };
            else style = { top: uiState.mapVisibleTop + pad + "px", right: pad + "px", width: "3rem" };
            style.opacity = uiState.wsStarted ? 1 : 0;
            return style;
        }
    }));

    const bu = window["__efpBaseUrl"];
    return useObserver(() => (
        <a href="https://expofp.com/" target="_blank" className="logo-overlay" style={s.style} rel="noopener noreferrer">
            <img src={bu + "expofp-overlay.png"} alt="Made with ExpoFP" />
        </a>
    ));
}
