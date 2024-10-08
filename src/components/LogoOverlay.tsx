import classNames from "classnames";
import Color from "color";
import React from "react";
import { useLocalStore, useObserver } from "mobx-react-lite";
import QRCode from "react-qr-code";
import data from "../data";
import store, { uiState } from "../store";
import settings from "../tools/settings";
import { remsToPixels } from "../utils";
import { t } from "../utils/i18n";
import isFromDesigner from "../utils/is-from-designer";
import Alert from "./Alert";
import "./Alert.scss";
import "./LogoOverlay.scss";
import { fpGeo } from "./Mapbox/utils/fpGeo";

export default function LogoOverlay() {
    const s = useLocalStore(() => ({
        get style() {
            const pad = uiState.overlayPosition === "left" ? remsToPixels(1) : remsToPixels(0.5);
            let style: any;
            if (uiState.overlayPosition === "left")
                style = {
                    bottom: (uiState.kiosk && uiState.wsStarted ? remsToPixels(3.5) : 0) + uiState.mapVisibleBottom + pad + "px",
                    [uiState.rtl ? "left" : "right"]: pad + "px",
                    width: "5rem",
                };
            else {
                style = { top: uiState.mapVisibleTop + pad + "px", [uiState.rtl ? "left" : "right"]: pad + "px", width: "3rem" };
                if (store.mapboxStore.showMapbox) style.top = remsToPixels(0.5) + "px";
            }
            style.opacity = uiState.wsStarted ? 1 : 0;
            return style;
        },

        get warningStyle() {
            const pad = uiState.overlayPosition === "left" ? remsToPixels(1) : remsToPixels(0.5);
            let style: any;
            if (uiState.overlayPosition === "left")
                style = {
                    bottom: uiState.mapVisibleBottom + 2 * pad + "px",
                    [uiState.rtl ? "left" : "right"]: pad + "px",
                    width: "3rem",
                };
            else {
                style = {
                    top: uiState.mapVisibleTop + 2 * pad + "px",
                    [uiState.rtl ? "left" : "right"]: pad + "px",
                    width: "2rem",
                };
                if (store.mapboxStore.showMapbox) style.top = remsToPixels(0.5) + "px";
            }
            style.opacity = uiState.wsStarted ? 1 : 0;
            return style;
        },
    }));

    const bu = window["__efpBaseUrl"];

    var dataSize = Math.round(window["__fpStat"]?.dataSize / 1024 / 1024 || 0);
    var showWarning = isFromDesigner && dataSize >= 10;
    var showMapboxWarning = isFromDesigner && !fpGeo && data.allow3dView && !uiState.kiosk && !uiState.heatmap;

    let point = "";
    if (uiState.kiosk && store.routeStore.defaultFrom?.paths) {
        //   let paths = store.routeStore.defaultFrom?.paths;
        // const p = (point = (paths[0] as any).triangles[0][0]);
        // point = "?blue-dot=" + p[0] + "," + p[1] + "," + (store.routeStore.defaultFrom?.layer?.name ?? "") + ",1";
    }

    return useObserver(() => (
        <div>
            <a
                href="https://expofp.com/"
                target="_blank"
                className={classNames("logo-overlay", {
                    invert: Color(settings.backgroundColor).isDark() || fpGeo?.properties?.style?.indexOf("dark") > -1,
                })}
                style={s.style}
                rel="noopener noreferrer"
            >
                <img src={bu + "expofp-overlay.png"} alt={t("Made with ExpoFP")} />
            </a>
            {showWarning && (
                <Alert title="This floor plan is too big" variant="warning" showIcon={true} position="bottomRight">
                    <a rel="noopener noreferrer" target="_blank" href="https://expofp.com/pages/huge-fp-warning">
                        Read how to optimize it
                    </a>
                </Alert>
            )}
            {showMapboxWarning && (
                <Alert title="3D view is hidden" variant="warning" showIcon={true} position="bottomRight">
                    <a rel="noopener noreferrer" target="_blank" href="https://expofp.com/pages/expofp-mapbox-integration">
                        Setup mapbox first
                    </a>
                </Alert>
            )}
            {uiState.kiosk && (
                <div
                    className={classNames("qr", { "qr--right": settings.EXPO === "metstrade-superyacht2023" || uiState.rtl })}
                    style={{
                        bottom: remsToPixels(uiState.wsStarted ? 4.5 : 0.5),
                    }}
                >
                    <div>View Map on Phone</div>
                    <QRCode value={`https://${settings.EXPO}.expofp.com/${point}`} size={100} />
                </div>
            )}
        </div>
    ));
}
