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
        <div className={`overlay-bar-back ${divClass()}`}>
            <i className={`overlay-bar-back__icon1 far ${icon1Class()}`} />
            <button className={`overlay-bar-back__icon2 far ${icon2Class()}`} onClick={handleClick}></button>
        </div>
    );

    function divClass() {
        return classNames({
            anim: true,
            end: animationEnded,
            start: !animationEnded
        });
    }

    function icon1Class() {
        return !showBack ? "fa-chevron-left" : "fa-bars";
    }

    function icon2Class() {
        return showBack ? "fa-chevron-left" : "fa-bars";
    }

    function handleClick(e: MouseEvent) {
        e.preventDefault();
        if (showBack) onBack();
        else store.uiState.menu = true;
    }
};

export default OverlayBarBack; //observer(OverlayBarBack);
