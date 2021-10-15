import classNames from "classnames";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React from "react";
import { floors } from "../data/svg";
import store, { uiState } from "../store";
import { remsToPixels } from "../utils";
import "./Floors.scss";

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
                .sort((f1, f2) => f1.name[0].toUpperCase().localeCompare(f2.name[0].toUpperCase()))
                .map((f) => (
                    <div className="item" key={f.name} onClick={() => store.clickFloor(f)} title={f.name}>
                        {f.name[0].toUpperCase()}
                    </div>
                ))}
        </div>
    ));
}
