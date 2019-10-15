import classNames from "classnames";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React, { FocusEvent, KeyboardEvent, useEffect, useRef } from "react";
import data from "../data";
import store, { uiState } from "../store";
import { useAutorun } from "../utils/mobx";
import OverlayContent from "./OverlayContent";
import List from "./List";
import "./Search.scss";
// import logger from "../tools/logger";

const placeHolder = data.hideCompanies
    ? `Search ${data.boothTerm.toLowerCase()}`
    : `Search company, ${data.boothTerm.toLowerCase()} or category`;

function Search() {
    const el = useRef<HTMLDivElement>();

    const s = useLocalStore(() => ({
        elementTop: 0,
        get hideRealInput() {
            return uiState.overlayBottom ? this.elementTop > 50 || uiState.overlaySize !== "full" : false;
        },
        get text() {
            return uiState.list.type === "search" ? uiState.list.text : "";
        },
        get bottomFull() {
            return uiState.overlaySize === "full" && uiState.overlayPosition === "bottom";
        },
        get showClose() {
            return !!this.text;
        },
        get backMode() {
            return this.text ? "back" : "menu";
        }
    }));

    function getInput(): HTMLInputElement {
        return el.current.querySelector ? el.current.querySelector("input[type=search]") : null;
    }

    useAutorun(() => {
        if (uiState.overlaySize !== "full" && document.activeElement === getInput()) {
            getInput().blur();
        }
    });

    useAutorun(() => {
        const i = getInput();
        if (i && uiState.searchFocused && document.activeElement !== i) {
            i.focus();
        }
    });

    useEffect(() => {
        const setTop = () => {
            s.elementTop = el.current.getBoundingClientRect().top;
        };
        setTop();
        const intervalId = window.setInterval(setTop, 50);
        return () => window.clearInterval(intervalId);
    }, [s]);

    // useEffect(() => {
    //     const setPosition = () => {
    //         // if (!el.current.tagName) return;
    //         const newVal = el.current.getBoundingClientRect().top > 50;
    //         s.hideRealInput = newVal || uiState.overlaySize !== "full";
    //         // logger.log("s.hideRealInput", s.hideRealInput, uiState.overlaySize, el.current.getBoundingClientRect().top > 50)
    //     };
    //     setPosition();
    //     const intervalId = window.setInterval(setPosition, 50);
    //     return () => window.clearInterval(intervalId);
    // }, [s]);

    return useObserver(() => {
        const fakeInput = s.hideRealInput ? (
            <input type="search" placeholder={placeHolder} value={s.text} onFocus={handleReplicaFocus} readOnly />
        ) : null;
        const bar = (
            <div className="search__bar" ref={el}>
                <input
                    type="search"
                    className={classNames({ fixed: s.hideRealInput })}
                    placeholder={placeHolder}
                    value={s.text}
                    onChange={setText}
                    onKeyDown={handleKeydown}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
                {fakeInput}
            </div>
        );
        // console.log("Search", s.hideRealInput, s.text);
        return (
            <OverlayContent onClose={handleClose} onBack={handleBack} backMode={s.backMode} hideClose={!s.showClose} bar={bar}>
                <List />
            </OverlayContent>
        );
    });

    function setText() {
        const text = getInput().value;
        uiState.centerMap = true;
        uiState.activeListIndex = text ? 0 : -1;
        uiState.list = {
            type: "search",
            text,
            focused: document.activeElement === getInput()
        };
    }

    function handleFocus() {
        uiState.searchFocused = true;
    }

    function handleBlur() {
        uiState.searchFocused = false;
    }

    function handleKeydown(e: KeyboardEvent) {
        let delta = 0 as 0 | 1 | -1;
        switch (e.key) {
            case "Down":
            case "ArrowDown":
                delta = 1;
                break;
            case "Up":
            case "ArrowUp":
                delta = -1;
                break;
            case "Enter":
                e.preventDefault();
                store.openActiveListItem();
                return;
        }
        if (delta) {
            e.preventDefault();
            store.changeActiveListIndex(delta);
        }
    }

    function handleClose() {
        getInput().value = "";
        getInput().focus();
        setText();
    }

    function handleReplicaFocus(e: FocusEvent) {
        e.preventDefault();
        getInput().focus();
    }

    function handleBack() {
        getInput().value = "";
        setText();
        uiState.desiredOverlaySize = "medium";
    }
}

export default () =>
    useObserver(() => <>{!uiState.details && !uiState.menu && uiState.list.type === "search" ? <Search /> : null}</>);
