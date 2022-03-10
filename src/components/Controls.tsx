import classNames from "classnames";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React from "react";
import { svgArea } from "../data/svg";
import store, { uiState } from "../store";
import { remsToPixels } from "../utils";
import { t } from "../utils/i18n";
import "./Controls.scss";

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

    function zoom(val: -1 | 1) {
        uiState.zoomBy = val;
    }
}
