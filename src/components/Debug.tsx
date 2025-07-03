import React from "react";
import { useObserver } from "mobx-react-lite";

import store, { uiState } from "../store";
import debugCanvases from "../tools/debugCanvases";
import { t } from "../utils/i18n";

import "./Debug.scss";

function Debug() {
    const totalSquare = debugCanvases.map((item) => item.width * item.height).reduce((acc, num) => (acc += num), 0);

    const canvases = debugCanvases.map((item) => (
        <div className="debug__canvas" id={item.toDataURL()} key={item.toDataURL()}>
            {item.width}x{item.height}={item.width * item.height}
            <br />
            <img src={item.toDataURL()} alt="" crossOrigin="anonymous" />
        </div>
    ));

    return (
        <div className="debug">
            <button onClick={() => store.selectSearch("")}>{t("Close")}</button>
            <div>Total square: {totalSquare}</div>
            {canvases}
        </div>
    );
}

export default () => useObserver(() => <>{uiState.list.type === "search" && uiState.list.text === "q1" ? <Debug /> : null}</>);
