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

export default function Floors() {
    var data: { active: boolean; name: string }[] = [];

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
        var layer = store.layerStore.layers.find((l) => l.description == name);
        if (store.layerStore.mode == LayersMode.Radio) store.layerStore.updateVisibility(layer.name, true);
        else store.layerStore.updateVisibility(layer.name, !layer.visible);
    };

    return useObserver(() => {
        data = store.layerStore.layers
            .filter((l) => !l.frozen)
            .map((l) => {
                return { name: l.description, active: l.visible };
            });

        return (
            (store.layerStore.mode === LayersMode.Radio || store.layerStore.mode === LayersMode.CheckBox) && (
                <div className={s.className} style={s.style}>
                    {data.map((f) => (
                        <div
                            className={classNames("item", { active: f.active })}
                            key={f.name}
                            onClick={() => click(f.name)}
                            title={f.name}
                        >
                            {parseName(f.name)}
                        </div>
                    ))}
                </div>
            )
        );
    });
}
