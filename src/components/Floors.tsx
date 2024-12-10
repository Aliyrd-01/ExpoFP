import classNames from "classnames";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React from "react";
import Rect from "../core/Rect";
import store, { uiState } from "../store";
import { Layer, LayerMode, LayersMode } from "../store/LayerStore";
import settings from "../tools/settings";
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
            return {
                top: uiState.mapVisibleTop + remsToPixels(uiState.overlayPosition === "left" ? 1.5 : 1.5) + "px",
            };
        },
    }));

    var click = (layer: Layer) => {
        if (timeout) return;
        timeout = setTimeout(() => (timeout = null), 500);
        var layer = store.layerStore.layers.find((l) => l.description === layer.description);

        if (store.layerStore.mode === LayersMode.Radio) {
            store.layerStore.updateVisibility(layer, true, true);
            store.routeStore.currentRouteLayer = layer;

            if (store.mapboxStore.showMapbox) return;

            if (settings.EXPO.indexOf("money2020usa") > -1 || settings.EXPO === "rodion2") {
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
        data = store.layerStore.layers
            .filter((l) => !l.frozen && !l.rootParent)
            .concat(
                store.routeStore.layers.filter((l) => l.mode !== LayerMode.AlwaysHidden && l.mode !== LayerMode.AlwaysVisible),
            )
            .filter((value, index, array) => array.indexOf(value) === index)
            .reverse()
            .map((l) => {
                return {
                    layer: l,
                    shortName: l.shortName,
                    description: l.description,
                    active: l.visible,
                    disabled: store.routeStore.layers.length && store.routeStore.layers.indexOf(l) === -1,
                };
            });

        return (
            (store.layerStore.mode === LayersMode.Radio || store.layerStore.mode === LayersMode.CheckBox) && (
                <div className={s.className} style={s.style}>
                    {data.map((l) => (
                        <div
                            className={classNames("item", {
                                active: l.active, disabled: l.disabled,
                                "full-name": !appData.shortLevelName,
                            })}
                            key={l.layer.description}
                            onClick={() => click(l.layer)}
                            title={l.layer.description}
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
