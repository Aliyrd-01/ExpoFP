import { useObserver } from "mobx-react-lite";
import React from "react";
import store, { uiState } from "../store";
import debugCanvases from "../tools/debugCanvases";
import "./Debug.scss";
import { t } from "../utils/i18n";

function Debug() {
    const canvases = debugCanvases.map(item => (
        <div className="debug__canvas" key={item.toDataURL()}>
            {item.width}x{item.height}={item.width * item.height}
            <br />
            <img src={item.toDataURL()} alt="" />
        </div>
    ));

    return (
        <div className="debug">
            <button onClick={() => store.selectSearch("")}>{t("Close")}</button>
            {canvases}
        </div>
    );
}

export default () => useObserver(() => <>{uiState.list.type === "search" && uiState.list.text === "q1" ? <Debug /> : null}</>);
