import classNames from "classnames";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React from "react";
import { svgArea } from "../data/svg";
import store, { uiState } from "../store";
<<<<<<< HEAD
import { LayersMode } from "../store/LayerStore";
=======
>>>>>>> remotes/origin/features/mapbox
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
                left: uiState.mapVisibleLeft + remsToPixels(0.7) + "px",
                top: uiState.mapVisibleTop + remsToPixels(0.7) + "px",
            };
        },
    }));

<<<<<<< HEAD
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
                layersList={
                    store.layerStore.mode === LayersMode.Radio || store.layerStore.mode === LayersMode.CheckBox ? layers : null
                }
                onChangeLayers={(layer) => {
                    store.layerStore.updateVisibility(layer, activeList.indexOf(layer) === -1);
                    uiState.details = null;
                }}
            />
        );
    });
=======
    return useObserver(() => (
        <div className={s.className} style={s.style}>
            {store.mapboxStore.mapBoxEnabled && (
                <button
                    className={classNames("fa fa-globe")}
                    title={t("Show map")}
                    onClick={() => {
                        store.selectNone();
                        store.mapboxStore.mapBoxSelected = null;
                    }}
                ></button>
            )}
            <button className="fa fa-plus" title={t("Zoom In")} onClick={zoom.bind(window, 1)}></button>
            <button className="fa fa-minus" title={t("Zoom Out")} onClick={zoom.bind(window, -1)}></button>
            <button
                className="fa fa-expand-arrows-alt"
                title={t("Fit to screen")}
                onClick={() => (uiState.moveToRect = svgArea)}
            ></button>
        </div>
    ));
>>>>>>> remotes/origin/features/mapbox

    function zoom(val: -1 | 1) {
        uiState.zoomBy = val;
    }
}
