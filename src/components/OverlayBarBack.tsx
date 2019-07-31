import classNames from "classnames";
import React, { MouseEvent, useEffect, useState } from "react";
import store from "../store";
import "./OverlayBarBack.scss";
const { uiState } = store;

const OverlayBarBack: React.FC<{ enableAnimation: boolean; backMode: "back" | "menu" | "none"; onBack: () => void }> = ({
    enableAnimation,
    backMode,
    onBack
}) => {
    const [animationEnded, setAnimationEnded] = useState(true);
    const [backTimeout, setBackTimeout] = useState(undefined);

    function divClass() {
        return classNames({
            anim: enableAnimation,
            end: animationEnded,
            start: !animationEnded
        });
    }

    const showBack = backMode === "back";

    function icon1Class() {
        return !showBack ? "fa-chevron-left" : "fa-bars";
    }

    function icon2Class() {
        return showBack ? "fa-chevron-left" : "fa-bars";
    }

    useEffect(() => {
        if (showBack) {
            setAnimationEnded(false);
            if (backTimeout) window.clearTimeout(backTimeout);
            const backTimeoutId = window.setTimeout(() => {
                setAnimationEnded(true);
            }, 20);
            setBackTimeout(backTimeoutId);
        }
        // TODO: do this work at all?
    }, [showBack, backTimeout]);

    if (backMode === "none") return null;
    return (
        <div className={`overlay-bar-back ${divClass()}`}>
            <i className={`overlay-bar-back__icon1 far ${icon1Class()}`} />
            <a className={`overlay-bar-back__icon2 far ${icon2Class()}`} href="/" onClick={handleClick}>
                &nbsp;
            </a>
        </div>
    );

    function handleClick(e: MouseEvent) {
        e.preventDefault();
        if (showBack) onBack();
        else uiState.menu = true;
    }
};

export default OverlayBarBack; //observer(OverlayBarBack);
