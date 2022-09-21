import { useLocalStore, useObserver } from "mobx-react-lite";
import React from "react";
import store, { uiState } from "../store";
import { remsToPixels } from "../utils";
import { t } from "../utils/i18n";
import isFromDesigner from "../utils/is-from-designer";
import "./LogoOverlay.scss";

export default function LogoOverlay() {
    const s = useLocalStore(() => ({
        get style() {
            const pad = uiState.overlayPosition === "left" ? remsToPixels(1) : remsToPixels(0.5);
            let style: any;
            if (uiState.overlayPosition === "left")
                style = { bottom: uiState.mapVisibleBottom + pad + "px", right: pad + "px", width: "5rem" };
            else {
                style = { top: uiState.mapVisibleTop + pad + "px", right: pad + "px", width: "3rem" };
                if (store.mapboxStore.mapBoxSelected) style.top = remsToPixels(0.5) + "px";
            }
            style.opacity = uiState.wsStarted ? 1 : 0;
            return style;
        },

        get warningStyle() {
            const pad = uiState.overlayPosition === "left" ? remsToPixels(1) : remsToPixels(0.5);
            let style: any;
            if (uiState.overlayPosition === "left")
                style = { bottom: uiState.mapVisibleBottom + 2 * pad + "px", right: pad + "px", width: "3rem" };
            else {
                style = { top: uiState.mapVisibleTop + 2 * pad + "px", right: pad + "px", width: "2rem" };
                if (store.mapboxStore.mapBoxSelected) style.top = remsToPixels(0.5) + "px";
            }
            style.opacity = uiState.wsStarted ? 1 : 0;
            return style;
        },
    }));

    const bu = window["__efpBaseUrl"];

    var dataSize = Math.round(window["__fpStat"]?.dataSize / 1024 / 1024 || 0);
    var showWarning = isFromDesigner && dataSize >= 10;

    return useObserver(() => (
        <div>
            <a href="https://expofp.com/" target="_blank" className="logo-overlay" style={s.style} rel="noopener noreferrer">
                <img src={bu + "expofp-overlay.png"} alt={t("Made with ExpoFP")} />
            </a>
            {showWarning && (
                <a
                    title={`File size ${dataSize}Mb. Maybe your plan is too slow.`}
                    href="https://expofp.com/"
                    target="_blank"
                    className="logo-overlay"
                    style={s.warningStyle}
                    rel="noopener noreferrer"
                >
                    <img src={bu + "warning.png"} alt={t("Made with ExpoFP")} />
                </a>
            )}
        </div>
    ));
}
