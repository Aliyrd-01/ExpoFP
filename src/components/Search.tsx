import "./Search.scss";
import OverlayContent from "./OverlayContent";
import copyToClipboard from "copy-to-clipboard";
import { VisibilityProperty } from "csstype";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React, { FocusEvent } from "react";
import data from "../data";
import store, { categoryStore, exhibitorStore, uiState } from "../store";
import baseUrl from "../tools/base-data-url";
import { useAutorun } from "../utils/mobx";
import classNames from "classnames";

const placeHolder = `Search company, ${data.boothTerm.toLowerCase()} or category`;

export default function Search() {
    const s = useLocalStore(() => ({
        hideRealInput: false
    }));

    return useObserver(() => {
        const bar = (
            <div className="search__bar">
                <input
                    type="search"
                    className={classNames({ fixed: s.hideRealInput })}
                    placeholder={placeHolder}
                    value={text}
                    onChange={setText}
                    keydown={handleKeydown}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />

                <input type="search" v-if="hideRealInput" placeholder={placeHolder} value={text} onFocus={handleReplicaFocus} />
            </div>
        );
        return <OverlayContent onClose={handleClose} onBack={handleBack} backMode="none" bar={bar} />;
    });

    function setText() {}
    function handleFocus() {}
    function handleBlur() {}
    function handleKeydown() {}
    function handleClose() {}

    function handleReplicaFocus(e: FocusEvent) {
        e.preventDefault();
    }

    function handleBack() {}
}
