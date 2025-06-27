import classNames from "classnames";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React from "react";
import Rect from "../core/Rect";
import store, { uiState } from "../store";
import { Layer, LayerMode, LayersMode } from "../store/LayerStore";
import settings from "../tools/settings";
import { t } from "../utils/i18n";
import { remsToPixels } from "../utils";
import "./Floors.scss";
import appData from "../data";

var timeout = null;
export default function Floors() {
    var data: { layer: Layer; active: boolean; disabled: boolean }[] = [];

    const s = useLocalStore(() => ({
        get className() {
            return classNames({ levels: true, "-ready": data.length });
        },
        get style() {
            let mapControlsSpaceY = 0;
            if (uiState.kiosk && uiState.mapControlsDOMRect) {
                mapControlsSpaceY = uiState.mapControlsDOMRect.y + uiState.mapControlsDOMRect.height;
            }

            return {
                top:
                    uiState.mapVisibleTop +
                    mapControlsSpaceY +
                    remsToPixels(uiState.overlayPosition === "left" ? 1.5 : 1.5) +
                    "px",
            };
        },
    }));

    var click = (layer: Layer) => {
        if (timeout) return;
        timeout = setTimeout(() => (timeout = null), 500);
        var layer = store.layerStore.layers.find((l) => l.description === layer.description);

        if (store.layerStore.mode === LayersMode.Radio) {
            store.layerStore.updateVisibility(layer, true, true);

            if (store.mapboxStore.showMapbox) return;

            if (
                settings.EXPO.indexOf("money2020usa") > -1 ||
                settings.EXPO === "rodion2" ||
                settings.EXPO === "possible2025" ||
                settings.EXPO === "2025virtuosotravelweek"  ||
                settings.EXPO === "zscalerskofy26"
            ) {
                uiState.moveToRect = Rect.fromX1y1x2y2(layer.rect.x1, layer.rect.y1, layer.rect.x2, layer.rect.y2);
            } else {
                var i1 = store.layerStore.layers.indexOf(store.layerStore.layers.filter((l) => !l.frozen && l.visible)[0]);
                var i2 = store.layerStore.layers.indexOf(layer);

                if (i1 === i2) return;
                if (i2 < i1) uiState.zoomBy = 0.95;
                else uiState.zoomBy = 1.05;
            }
        } else store.layerStore.updateVisibility(layer, !layer.visible);
    };

    return useObserver(() => {
        data = store.layerStore.floors;
        return (
            (store.layerStore.mode === LayersMode.Radio || store.layerStore.mode === LayersMode.CheckBox) && (
                <div className={s.className} style={s.style} role="radiogroup" aria-label={t("Floor Selection")}>
                    {data.map((l) => (
                        <div
                            className={classNames("item", {
                                active: l.active,
                                disabled: l.disabled,
                                "full-name": !appData.shortLevelName,
                            })}
                            key={l.layer.description}
                            role="radio"
                            title={`${l.active ? t("Current Floor") : t("Floor")} ${l.layer.description}`}
                            aria-label={`${l.active ? t("Current Floor") : t("Floor")} ${l.layer.description}`}
                            aria-checked={l.active}
                            aria-disabled={l.disabled ? "true" : "false"}
                            tabIndex={l.disabled ? -1 : 0}
                            onClick={() => {
                                if (!l.disabled) click(l.layer);
                            }}
                            onKeyDown={(e) => {
                                if (!l.disabled && (e.key === "Enter" || e.key === " ")) {
                                    e.preventDefault();
                                    click(l.layer);
                                }
                            }}
                            dir="auto"
                        >
                            <span>{appData.shortLevelName ? l.layer.shortName : l.layer.description}</span>
                        </div>
                    ))}
                </div>
            )
        );
    });
}
