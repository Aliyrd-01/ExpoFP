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

const isExpoRightAligned = ["info-techlive2025", "metstrade-superyacht2023"].includes(settings.EXPO);
const isDarkMode = Color(settings.backgroundColor).isDark() || fpGeo?.properties?.style?.includes("dark");

export default function LogoOverlay() {
    const s = useLocalStore(() => {
        const getPositionStyle = (topBottom: "top" | "bottom", side: "left" | "right", offset: number, width: string) => ({
            [topBottom]: offset + "px",
            [side]: remsToPixels(1) + "px",
            width,
            opacity: uiState.wsStarted ? 1 : 0,
        });

        const side = isExpoRightAligned || uiState.rtl ? "left" : "right";

        return {
            get style() {
                const pad = remsToPixels(uiState.overlayPosition === "left" ? 1 : 0.3);

                if (uiState.overlayPosition === "left") {
                    const bottom = (uiState.kiosk && uiState.wsShown ? remsToPixels(3.5) : 0) + uiState.mapVisibleBottom + pad;
                    return getPositionStyle("bottom", side, bottom, "5rem");
                } else {
                    let top = uiState.mapVisibleTop + pad;
                    if (store.mapboxStore.showMapbox) top = remsToPixels(0.5);
                    return getPositionStyle("top", side, top, "4.5rem");
                }
            },

            get warningStyle() {
                const pad = remsToPixels(uiState.overlayPosition === "left" ? 1 : 0.5);

                if (uiState.overlayPosition === "left") {
                    const bottom = uiState.mapVisibleBottom + 2 * pad;
                    return getPositionStyle("bottom", side, bottom, "3rem");
                } else {
                    let top = uiState.mapVisibleTop + 2 * pad;
                    if (store.mapboxStore.showMapbox) top = remsToPixels(0.5);
                    return getPositionStyle("top", side, top, "2rem");
                }
            },
        };
    });

    const baseUrl = window["__efpBaseUrl"];
    const dataSize = Math.round(window["__fpStat"]?.dataSize / 1024 / 1024 || 0);
    const showWarning = isFromDesigner && dataSize >= 10;
    const showMapboxWarning = isFromDesigner && !fpGeo && data.allow3dView && !uiState.kiosk && !uiState.heatmap;

    const showQR = uiState.kiosk && !uiState.selectedRoute?.to && !uiState.selectedRoute?.from && !uiState.kioskSetup;

    const qrClassName = classNames("qr", {
        "qr--right": isExpoRightAligned || uiState.rtl,
    });

    return useObserver(() => (
        <div>
            <a
                href="https://expofp.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={classNames("logo-overlay", { invert: isDarkMode })}
                style={s.style}
            >
                <img src={`${baseUrl}expofp-overlay.png`} alt={t("Made with ExpoFP")} crossOrigin="anonymous" />
            </a>

            {showWarning && (
                <Alert title="This floor plan is too big" variant="warning" showIcon position="bottomRight">
                    <a rel="noopener noreferrer" target="_blank" href="https://expofp.com/pages/huge-fp-warning">
                        {t("Read how to optimize it")}
                    </a>
                </Alert>
            )}

            {showMapboxWarning && (
                <Alert title="3D view is hidden" variant="warning" showIcon position="bottomRight">
                    <a rel="noopener noreferrer" target="_blank" href="https://expofp.com/pages/expofp-mapbox-integration">
                        {t("Setup mapbox first")}
                    </a>
                </Alert>
            )}

            {showQR && (
                <div className={qrClassName} style={{ bottom: remsToPixels(uiState.wsShown ? 4.5 : 1) }}>
                    <div>{t("View Map on Phone")}</div>
                    <QRCode value={uiState.viewMapOnPhoneQRCodeUrl} size={100} />
                </div>
            )}
        </div>
    ));
}
