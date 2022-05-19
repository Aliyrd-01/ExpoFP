import classNames from "classnames";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React from "react";
import { floors } from "../data/svg";
import store, { uiState } from "../store";
import { remsToPixels } from "../utils";
import "./Floors.scss";

function parseName(name: string): string {
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    else return `${parts[0][0].toUpperCase()}${parts[1][0].toUpperCase()}`;
}

export default function Floors() {
    const s = useLocalStore(() => ({
        get className() {
            return classNames({ levels: true, "-ready": uiState.wsStarted && floors.length });
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
            {floors
                .map((f) => f.name)
                .map((f) => (
                    <div className="item" key={f} onClick={() => store.clickFloor(f)} title={f}>
                        {parseName(f)}
                    </div>
                ))}
        </div>
    ));
}
