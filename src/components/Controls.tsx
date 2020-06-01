import classNames from "classnames";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React from "react";
import { uiState } from "../store";
import { remsToPixels } from "../utils";
import { t } from "../utils/i18n";
import "./Controls.scss";

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

    return useObserver(() => (
        <div className={s.className} style={s.style}>
            <button className="fa fa-plus" title={t("Zoom In")} onClick={zoom.bind(window, 1)}></button>
            <button className="fa fa-minus" title={t("Zoom Out")} onClick={zoom.bind(window, -1)}></button>
        </div>
    ));

    function zoom(val: -1 | 1) {
        uiState.zoomBy = val;
    }
}
