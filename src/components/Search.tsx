import classNames from "classnames";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React, { FocusEvent, KeyboardEvent, useEffect, useRef, useCallback } from "react";
import data from "../data";
import store, { exhibitorStore, uiState } from "../store";
import { t } from "../utils/i18n";
import { useAutorun } from "../utils/mobx";
import EntityList from "./EntityList";
import OverlayContent from "./OverlayContent";
import debounce from "../tools/debounce";
import { GaEventActions, sendEventToGa } from "../tools/gtag";
import "./Search.scss";
import * as YouAreHere from "../utils/yah";
import { isLocalStorageAvailable } from "../utils/localStorage";
import settings from "../tools/settings";
import { KIOSK_KEY } from "../constants";
import { getRebookingTokenFromQuery } from "../tools/rebookingUrl";
import isMobile from "../utils/is-mobile";
import isWebview from "../utils/is-webview";

const DEBOUNCE_DELAY_MS = 1000;
const isMobileDevice = isMobile || isWebview;

export function handleCustomCommand(text: string, forseRefresh: boolean): boolean {
    text = text.trim();

    if (text.startsWith(`${YouAreHere.yahKey}`)) {
        const commandValue = text.substr(YouAreHere.yahKey.length).trim();
        var url = window.location.origin + window.location.pathname;
        if (commandValue[1] === undefined) {
            const yah = YouAreHere.getYah();
            alert(`"You are here" coordinantes: ${yah[0]} ${yah[1]}, scale ${yah[2]}`);
        } else if (commandValue === "none") {
            /** @deprecated use yah=<COMMAND> */
            YouAreHere.removeYah();
            isLocalStorageAvailable && localStorage.removeItem(KIOSK_KEY);
            if (forseRefresh) window.location.replace(url);
        } else if (commandValue.split(",").length === 1) {
            /** @deprecated use yah=<COMMAND> */
            YouAreHere.setYah(commandValue.split(",")[0]);
            if (isLocalStorageAvailable && !isMobileDevice) {
                localStorage.setItem(KIOSK_KEY, "1");
                uiState.kiosk = true;
            }
            if (forseRefresh) window.location.replace(url);
        } else if (commandValue.split(",").length === 2 || commandValue.split(",").length === 3) {
            const yahValues = commandValue.split(",");
            const yahX = parseFloat(yahValues[0].trim());
            const yahY = parseFloat(yahValues[1].trim());
            let scale = 1;
            if (commandValue.split(",").length === 3) scale = parseFloat(yahValues[2].trim());
            if (!!yahX && !!yahY) {
                YouAreHere.setYah(`${yahX},${yahY},${scale}`);
                if (isLocalStorageAvailable && !isMobileDevice) {
                    localStorage.setItem(KIOSK_KEY, "1");
                    uiState.kiosk = true;
                }
                if (forseRefresh) window.location.replace(url);
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
    } else if (/^copy_exh=\d+/.test(text)) {
        const match = text.match(/^copy_exh=(\d+)/);
        if (match && !isNaN(parseInt(match[1]))) {
            const currentURL = window.location.origin + window.location.pathname;
            const newURL = `${currentURL}?${match[0]}`;
            window.location.replace(newURL);
        }
    } else if (getRebookingTokenFromQuery()) {
        return true;
    }

    return false;
}

function Search() {
    const el = useRef<HTMLDivElement>();
    const overlayContentRef = useRef<HTMLDivElement>();
    const scrollableRef = useRef<HTMLDivElement>();

    const s = useLocalStore(() => ({
        elementTop: 0,
        updateOverlayContent: null as () => void,
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
            if (settings.EXPO.startsWith("lenzerheidemotorclassics")) return "SUCHE";
            if (settings.EXPO.startsWith("jetlag")) return "Search location or artist";
            if (uiState.heatmapYah) {
                return t("Find scans above");
            }
            return (
                data.searchText ||
                (exhibitorStore.exhibitors.length === 0
                    ? t("Search {{boothTerm}}", { boothTerm: data.boothTerm.toLowerCase() })
                    : t("Search company, {{boothTerm}} or category", { boothTerm: data.boothTerm.toLowerCase() }))
            );
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
        if (uiState.menu && uiState.kiosk) {
            uiState.searchFocused = false;
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
            if (!el.current) return;
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

    useEffect(() => {
        store.fuzzySearchEngineStore.loadEngine();
    }, []);

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
                sendEventToGa(GaEventActions.Search, s.text);
            }
        }, DEBOUNCE_DELAY_MS),
        [s]
    );

    const updateContent = useCallback(() => {
        if (s.updateOverlayContent) s.updateOverlayContent();
    }, [s.updateOverlayContent]);

    return useObserver(() => {
        const fakeInput = s.hideRealInput ? (
            <input type="search" placeholder={s.placeHolder} value={s.text} onFocus={handleReplicaFocus} readOnly />
        ) : null;
        const bar = (
            <div className="efp-search-bar" ref={el} role="search">
                <input
                    type="search"
                    className={classNames({ fixed: s.hideRealInput })}
                    placeholder={s.placeHolder}
                    aria-label="Search"
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
            <OverlayContent
                onUpdateFuncSet={(f) => (s.updateOverlayContent = f)}
                onClose={handleClose}
                onBack={handleBack}
                backMode={s.backMode}
                hideClose={!s.showClose}
                bar={bar}
                passRefToParent={(ref) => (overlayContentRef.current = ref.current)}
                passScrollableRef={(ref) => (scrollableRef.current = ref.current)}
            >
                <EntityList updateScroll={updateContent} updatedScrollableRef={scrollableRef} />
            </OverlayContent>
        );
    });

    function handleChange() {
        window["__resett"]?.();
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

    function handleBlur(e: FocusEvent) {
        if (overlayContentRef.current.contains(e.relatedTarget)) {
            return;
        }
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
                handleCustomCommand(getInput().value, true);
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
        if (uiState.kiosk) {
            uiState.searchFocused = false;
        }
        getInput().value = "";
        setText();

        const selectedBooth = uiState.details;
        const hasEvents = selectedBooth && "schedule" in selectedBooth && selectedBooth.schedule?.length > 0;

        if (!hasEvents) {
            uiState.desiredOverlaySize = "medium";
        }
    }
}

export default () =>
    useObserver(() => <>{!uiState.details && !uiState.menu && uiState.list.type === "search" ? <Search /> : null}</>);
