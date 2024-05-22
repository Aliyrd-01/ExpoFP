import classNames from "classnames";
import { useLocalStore, useObserver } from "mobx-react-lite";
import * as React from "react";
import { svgArea } from "../data/svg";
import store, { layersStore, uiState } from "../store";
import { LayerMode, LayersMode } from "../store/LayerStore";
import { remsToPixels } from "../utils";
import { t } from "../utils/i18n";
import "./Controls.scss";
import MapControls from "./MapControls";

export default function Controls() {
    const s = useLocalStore(() => ({
        get className() {
            return classNames({ controls: true, container: true, "-ready": true, [uiState.responsiveClass]: true });
        },
        get style() {
            return {
                [uiState.rtl ? "right" : "left"]: uiState.overlayCollapsed
                    ? remsToPixels(0.9)
                    : (uiState.kiosk ? 10 : 0) + uiState.mapVisibleStart + remsToPixels(0.7) + "px",
                top: uiState.overlayCollapsed ? remsToPixels(5) : uiState.mapVisibleTop + remsToPixels(0.7) + "px",
            };
        },

        get layers(): any {
            return layersStore.layers
                .filter((l) => l.mode !== LayerMode.AlwaysHidden && l.mode !== LayerMode.AlwaysVisible)
                .map((l) => ({ id: l.name, name: l.description, visible: l.visible }))
                .concat([])
                .reverse();
        },

        get visible() {
            return layersStore.layers.filter((l) => l.visible).map((l) => l.name);
        },
    }));

    return useObserver(() => {
        return (
            <MapControls
                className={s.className}
                style={s.style}
                titles={[t("Find your location"), t("Zoom In"), t("Zoom Out"), t("View switch"), t("Fit to screen"), t("Layers")]}
                onClickFindLocation={() => store.routeStore.findLocation()}
                onClickZoomIn={() => (uiState.zoomBy = 1.5)}
                onClickZoomOut={() => (uiState.zoomBy = 0.66)}
                onClickByWidth={() => (uiState.moveToRect = store.layerStore.rectangle || svgArea)}
                onViewModeSwitch={() => store.mapboxStore.activateMapbox()}
                viewModeSwitch={store.mapboxStore.mapBoxEnabled && !store.mapboxStore.hideModeSwitchButton}
                viewMode={store.mapboxStore.showMapbox}
                findLocation={!!store.routeStore.defaultFrom || !!store.routeStore.currentPosition}
                layersActiveItems={s.visible}
                layersList={layersStore.mode === LayersMode.CheckBox ? s.layers : null}
                onChangeLayers={(layer) => {
                    layersStore.updateVisibility(layer, !layersStore.layers.find((l) => l.name === layer).visible);
                }}
            />
        );
    });
}
