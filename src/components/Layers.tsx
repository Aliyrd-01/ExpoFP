import classNames from "classnames";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React from "react";
import store, { uiState } from "../store";
import { remsToPixels } from "../utils";
import "./Layers.scss";

export default function Layers() {
    const s = useLocalStore(() => ({
        get className() {
            return classNames({ levels: true, "-ready": uiState.wsStarted && store.layerStore.layers.length });
        },
        get style() {
            return {
                right: remsToPixels(0.5) + "px",
                top: uiState.mapVisibleTop + remsToPixels(uiState.overlayPosition === "left" ? 0.7 : 1.5) + "px",
            };
        },
    }));

    return useObserver(() => (
        <div className={s.className} style={s.style}>
            {store.layerStore.layers.map((layer) => (
                <div
                    style={{ opacity: layer.visible ? 1 : 0.3 }}
                    className="item"
                    key={layer.name}
                    onClick={() => {
                        uiState.updateLayersVisibility([{ name: layer.name, visible: !layer.visible }]);
                    }}
                    title={layer.name}
                >
                    {layer.name.substring(0, 2).toUpperCase()}
                </div>
            ))}
        </div>
    ));
}
