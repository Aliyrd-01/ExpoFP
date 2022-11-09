import classNames from "classnames";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React, { FocusEvent, KeyboardEvent, useEffect, useRef, useCallback } from "react";
import data from "../data";
import store, { exhibitorStore, uiState } from "../store";
import { t } from "../utils/i18n";
import { useAutorun } from "../utils/mobx";
import List from "./List";
import OverlayContent from "./OverlayContent";
import debounce from "../tools/debounce";
import { GaEventActions, sendEventToGa } from "../tools/gtag";
import "./Search.scss";
// import logger from "../tools/logger";
import * as YouAreHere from "../utils/yah";
import { kioskKey } from "../store/init/init-ui";

const DEBOUNCE_DELAY_MS = 2000;

export function hanleCustomCommand(text: string): boolean {
    text = text.trim();

    if (text.startsWith(`${YouAreHere.yahKey}`)) {
        const commandValue = text.substr(YouAreHere.yahKey.length).trim();
        if (commandValue[1] === undefined) {
            const yah = YouAreHere.getYah();
            alert(`"You are here" coordinantes: ${yah[0]} ${yah[1]}, scale ${yah[2]}`);
        } else if (commandValue === "none") {
            YouAreHere.removeYah();
            localStorage.removeItem(kioskKey);
            window.location.replace(window.location.origin);
        } else if (commandValue.split(",").length === 1) {
            YouAreHere.setYah(commandValue.split(",")[0]);
            localStorage.setItem(kioskKey, "1");
            window.location.replace(window.location.origin);
        } else if (commandValue.split(",").length === 2 || commandValue.split(",").length === 3) {
            const yahValues = commandValue.split(",");
            const yahX = parseFloat(yahValues[0].trim());
            const yahY = parseFloat(yahValues[1].trim());
            let scale = 1;
            if (commandValue.split(",").length === 3) scale = parseFloat(yahValues[2].trim());
            if (!!yahX && !!yahY) {
                YouAreHere.setYah(`${yahX},${yahY},${scale}`);
                localStorage.setItem(kioskKey, "1");
                window.location.replace(window.location.origin);
            }
        }
        return true;
    } else if (text.toLowerCase() === "__addcache") {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
            if (!registrations.length) return alert("No registered service workers.");

            var images = [];
            store.exhibitorStore.exhibitors.forEach((exhibitor) => {
                images.push(exhibitor.logo);
                images.push(...(exhibitor.gallery || []));
            });

            Promise.all(images.map((image) => fetch(image)))
                .then((value) => alert(`${value.length} images loaded.`))
                .catch((error) => alert(error));
        });
    }
    return false;
}

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
        },
        get placeHolder() {
            return exhibitorStore.exhibitors.length === 0
                ? t("Search {{boothTerm}}", { boothTerm: data.boothTerm.toLowerCase() })
                : t("Search company, {{boothTerm}} or category", { boothTerm: data.boothTerm.toLowerCase() });
        },
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

    useEffect(() => {
        if (el.current) {
            window["__searchi"] = el.current;
        }
    }, [el]);

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

    const debouncedChange = useCallback(
        debounce(() => {
            if (s.text) {
                sendEventToGa(`FP`, GaEventActions.Search, s.text);
            }
        }, DEBOUNCE_DELAY_MS),
        [s]
    );

    return useObserver(() => {
        const fakeInput = s.hideRealInput ? (
            <input type="search" placeholder={s.placeHolder} value={s.text} onFocus={handleReplicaFocus} readOnly />
        ) : null;
        const bar = (
            <div className="search__bar" ref={el}>
                <input
                    type="search"
                    className={classNames({ fixed: s.hideRealInput })}
                    placeholder={s.placeHolder}
                    value={s.text}
                    onChange={handleChange}
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

    function handleChange() {
        setText();
        debouncedChange();
    }

    function setText() {
        const text = getInput().value;
        uiState.centerMap = true;
        uiState.activeListIndex = text ? 0 : -1;
        uiState.list = {
            type: "search",
            text,
            focused: document.activeElement === getInput(),
        };
    }

    function handleFocus() {
        uiState.searchFocused = true;
    }

    function handleBlur() {
        setTimeout(() => (uiState.searchFocused = false), 200);
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
                hanleCustomCommand(getInput().value);
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
