import classNames from "classnames";
import { useLocalStore, useObserver } from "mobx-react-lite";
import * as React from "react";
import { svgArea } from "../data/svg";
import store, { uiState } from "../store";
import { remsToPixels } from "../utils";
import { t } from "../utils/i18n";
import "./Controls.scss";
import MapControls from "./MapControls";

export default function Controls() {
    const s = useLocalStore(() => ({
        get className() {
            return classNames({ controls: true, container: true, "-ready": true });
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
                titles={[t("Find your location"), t("Zoom In"), t("Zoom Out"), t("View switch"), t("Fit to screen"), t("Layers")]}
                onClickFindLocation={() => store.selectBooth(store.routeStore.defaultFrom)}
                onClickZoomIn={() => (uiState.zoomBy = 1.5)}
                onClickZoomOut={() => (uiState.zoomBy = 0.66)}
                onClickByWidth={() => (uiState.moveToRect = store.layerStore.rectangle || svgArea)}
                onViewModeSwitch={() => (store.mapboxStore.mapBoxSelected = !store.mapboxStore.showMapbox)}
                viewModeSwitch={store.mapboxStore.mapBoxEnabled}
                viewMode={store.mapboxStore.showMapbox}
                findLocation={!!store.routeStore.defaultFrom}
                layersActiveItems={[]}
                layersList={null}
                onChangeLayers={(layer) => {}}
            />
        );
    });
}
