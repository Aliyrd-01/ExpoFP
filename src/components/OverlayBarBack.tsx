import classNames from "classnames";
import React, { MouseEvent, useEffect, useState } from "react";
import store from "../store";
import "./OverlayBarBack.scss";

type BackMode = "back" | "menu" | "none";

const OverlayBarBack: React.FC<{ backMode: BackMode; onBack: () => void }> = ({ backMode, onBack }) => {
    const showBack = backMode === "back";
    const [nextShowBack, setNextShowBack] = useState<boolean>(showBack);
    const animationEnded = nextShowBack === showBack;

    useEffect(() => {
        // set nextShowBack after initial render
        const timeoutId = window.setTimeout(() => {
            setNextShowBack(showBack);
        }, 20);
        return () => window.clearTimeout(timeoutId);
    }, [showBack]);

    // console.log("OverlayBarBack", isFirstRun.current, showBack, backMode, animationEnded, divClass(), icon1Class(), icon2Class());
    if (backMode === "none") return null;

    return (
        <div className="overlay-bar-back">
            <button className="overlay-bar-back__button" onClick={handleClick}>
                <i className={showBack ? "icon-chevron-left" : "icon-menu"}></i>
            </button>
        </div>
    );

    function handleClick(e: MouseEvent) {
        e.preventDefault();
        if (showBack) onBack();
        else store.uiState.menu = true;
    }
};

export default OverlayBarBack; //observer(OverlayBarBack);
