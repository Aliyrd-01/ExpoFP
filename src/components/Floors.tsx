import classNames from "classnames";
import { active } from "d3";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React from "react";
import { floors } from "../data/svg";
import store, { uiState } from "../store";
import { LayersMode } from "../store/LayerStore";
import { remsToPixels } from "../utils";
import "./Floors.scss";

function parseName(name: string): string {
    const parts = name.split(" ");
    if (parts.length === 1) return name.substring(0, 2).toUpperCase();
    else return `${parts[0][0].toUpperCase()}${parts[1][0].toUpperCase()}`;
}
var timeout = null;
export default function Floors() {
    var data: { active: boolean; description: string; disabled: boolean }[] = [];

    const s = useLocalStore(() => ({
        get className() {
            return classNames({ levels: true, "-ready": uiState.wsStarted && data.length });
        },
        get style() {
            return {
                right: remsToPixels(0.5) + "px",
                top: uiState.mapVisibleTop + remsToPixels(uiState.overlayPosition === "left" ? 0.7 : 1.5) + "px",
            };
        },
    }));

    var click = (name: string) => {
        if (timeout) return;
        timeout = setTimeout(() => (timeout = null), 1000);
        var layer = store.layerStore.layers.find((l) => l.description == name);
        if (store.layerStore.mode == LayersMode.Radio) {
            store.routeStore.currentPosition = null;
            store.layerStore.updateVisibility(layer.name, true, true);

            var i1 = store.layerStore.layers.indexOf(store.layerStore.layers.filter((l) => !l.frozen && l.visible)[0]);
            var i2 = store.layerStore.layers.indexOf(layer);

            if (i1 === i2) return;
            if (i2 < i1) uiState.zoomBy = 0.95;
            else uiState.zoomBy = 1.05;
        } else store.layerStore.updateVisibility(layer.name, !layer.visible);
    };

    return useObserver(() => {
        data = store.layerStore.layers
            .filter((l) => !l.frozen)
            .map((l) => {
                return {
                    description: l.description,
                    active: l.visible,
                    disabled: store.routeStore.layers.length && store.routeStore.layers.indexOf(l) == -1,
                };
            });

        return (
            (store.layerStore.mode === LayersMode.Radio || store.layerStore.mode === LayersMode.CheckBox) && (
                <div className={s.className} style={s.style}>
                    {data.map((f) => (
                        <div
                            className={classNames("item", { active: f.active, disabled: f.disabled })}
                            key={f.description}
                            onClick={() => click(f.description)}
                            title={f.description}
                        >
                            {parseName(f.description)}
                        </div>
                    ))}
                </div>
            )
        );
    });
}
