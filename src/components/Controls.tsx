import classNames from "classnames";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React from "react";
import Rect from "../core/Rect";
import { svgArea } from "../data/svg";
import store, { uiState } from "../store";
import { remsToPixels } from "../utils";
import { t } from "../utils/i18n";
import "./Controls.scss";
import MapControls from "./MapControls";

export default function Controls() {
    const s = useLocalStore(() => ({
        get className() {
            return classNames({ controls: true, container: true, "-ready": uiState.wsStarted });
        },
        get style() {
            return {
                left: uiState.overlayCollapsed
                    ? remsToPixels(0.9)
                    : (uiState.kiosk ? 10 : 0) + uiState.mapVisibleLeft + remsToPixels(0.7) + "px",
                top: uiState.overlayCollapsed ? remsToPixels(5) : uiState.mapVisibleTop + remsToPixels(0.7) + "px",
            };
        },
    }));

    return useObserver(() => {
        return (
            <MapControls
                className={s.className}
                style={s.style}
                titles={[t("Find your location"), t("Zoom In"), t("Zoom Out"), t("Fit to screen"), t("Layers")]}
                onClickFindLocation={() => {
                    let { rect } = store.routeStore.defaultFrom;
                    let x = store.routeStore.defaultFrom.rect.w * 5;
                    let y = store.routeStore.defaultFrom.rect.h * 5;
                    uiState.moveToRect = Rect.fromCxcywh(rect.cx, rect.cy, rect.w - x * 2, rect.h - y * 2);
                }}
                onClickZoomIn={() => (uiState.zoomBy = 1.5)}
                onClickZoomOut={() => (uiState.zoomBy = 0.66)}
                onClickByWidth={() => (uiState.moveToRect = store.layerStore.rectangle || svgArea)}
                findLocation={!!store.routeStore.defaultFrom}
                layersActiveItems={[]}
                layersList={null}
                onChangeLayers={(layer) => {}}
            />
        );
    });
}
