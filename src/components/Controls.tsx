import classNames from "classnames";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React from "react";
import { svgArea } from "../data/svg";
import store, { uiState } from "../store";
import { remsToPixels } from "../utils";
import { t } from "../utils/i18n";
import "./Controls.scss";
import MapControls from "./MapControls";

export default function Controls() {
    const s = useLocalStore(() => ({
        get className() {
            return classNames({ controls: true, "-ready": uiState.wsStarted });
        },
        get style() {
            return {
                left: uiState.mapVisibleLeft + remsToPixels(0.7) + "px",
                top: uiState.mapVisibleTop + remsToPixels(0.7) + "px",
            };
        },
    }));

    return useObserver(() => {
        const layers = store.layerStore.layers.map((l) => {
            return { name: l.description, id: l.name, visible: l.visible };
        });

        const activeList = layers.filter((l) => l.visible).map((l) => l.id);

        return (
            <MapControls
                className={s.className}
                style={s.style}
                titles={[t("Zoom In"), t("Zoom Out"), t("Fit to screen"), t("Layers")]}
                onClickZoomIn={zoom.bind(window, 1)}
                onClickZoomOut={zoom.bind(window, -1)}
                onClickByWidth={() => (uiState.moveToRect = store.layerStore.rectangle || svgArea)}
                layersActiveItems={activeList}
                layersList={layers}
                onChangeLayers={(layer) => {
                    store.layerStore.updateLayerVisibility(layer, activeList.indexOf(layer) == -1);
                    uiState.details = null;
                }}
            />
        );
    });

    function zoom(val: -1 | 1) {
        uiState.zoomBy = val;
    }
}
