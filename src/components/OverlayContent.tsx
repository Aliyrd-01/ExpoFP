import React, { ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import debounce from "lodash.debounce";
import PerfectScrollbar from "perfect-scrollbar";
import { ResizeObserver } from "resize-observer";

import { uiState } from "../store";
import customDebounce from "../tools/debounce";
import isScrollUgly from "../utils/is-scroll-ugly";

import { OverlayBar, OverlayGrip, OverlayParticles } from "./";

import "./OverlayContent.scss";

const OverlayContent: React.FC<{
    bar: ReactNode;
    className?: string;
    particles?: boolean;
    backMode: "back" | "menu" | "none";
    overlayBarCenterContent?: ReactNode;
    overlayBarEndContent?: ReactNode;
    overlayBarStyle?: React.CSSProperties;
    hideClose?: boolean;
    onBack?: () => void;
    onClose: () => void;
    onUpdateFuncSet?: (s: () => void) => void;
    passScrollableRef?: (el: React.RefObject<HTMLDivElement>) => void;
    passRefToParent?: (el: React.RefObject<HTMLDivElement>) => void;
    passPsToParent?: (el: PerfectScrollbar) => void;
}> = ({
    bar,
    className,
    particles,
    backMode,
    hideClose,
    onBack,
    onClose,
    children,
    overlayBarStyle,
    overlayBarCenterContent,
    overlayBarEndContent,
    onUpdateFuncSet,
    passScrollableRef,
    passRefToParent,
    passPsToParent,
}) => {
    const [scrolled, setScrolled1] = useState(false);
    const scrollable = useRef<HTMLDivElement>();
    const overlayBarRef = useRef<HTMLDivElement>();
    const [psInstance, setPsInstance] = useState<PerfectScrollbar>(null);
    const contentRef = useRef<HTMLDivElement>();

    useLayoutEffect(() => {
        if (passScrollableRef) passScrollableRef(scrollable);
    }, [scrollable, passScrollableRef]);

    useLayoutEffect(() => {
        if (passRefToParent) passRefToParent(contentRef);
    }, [contentRef, passRefToParent]);

    useLayoutEffect(() => {
        const sel = scrollable.current;
        const setScrolled = () => {
            setScrolled1(sel.scrollTop > 0);
            // logger.log("scrolled", sel.scrollTop, scrolled);
        };

        let update: () => void = () => {};

        if (isScrollUgly) {
            if (!psInstance) {
                const ps = new PerfectScrollbar(sel, { minScrollbarLength: 25 });
                ps.scrollbarY.tabIndex = 0;
                ps.scrollbarYRail.tabIndex = 0;
                setPsInstance(ps);
                update = () => ps.update();
            } else {
                update = () => psInstance.update();
            }
            sel.addEventListener("ps-scroll-y", setScrolled);
        } else {
            update = setScrolled;
            sel.addEventListener("scroll", setScrolled);
        }

        if (passPsToParent) passPsToParent(psInstance);
        if (onUpdateFuncSet) onUpdateFuncSet(update);

        window.addEventListener("resize", update);
        const observer = new MutationObserver(update);
        observer.observe(sel, { childList: true, subtree: true });

        return () => {
            if (psInstance) {
                psInstance.destroy();
                setPsInstance(null);
            }
            window.removeEventListener("resize", update);
            if (onUpdateFuncSet) onUpdateFuncSet(null);
            observer.disconnect();
        };
    }, [scrollable, onUpdateFuncSet, psInstance, passPsToParent]);

    useEffect(() => {
        if (uiState.overlaySize !== "full" && scrollable.current.scrollTop !== 0) {
            scrollable.current.scrollTop = 0;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uiState.overlaySize]);

    const updateScrollableHeight = () => {
        const bar = overlayBarRef.current;
        const scrollableEl = scrollable.current;

        if (!bar || !scrollableEl) return;

        const overlayBarHeight = bar.offsetHeight;
        const offset = uiState.overlayPosition === "bottom" ? 30 : 20;

        let kioskOffsetPx = 0;

        if (uiState.kiosk) {
            kioskOffsetPx += 16;

            if (uiState.wsShown) {
                kioskOffsetPx += 50;
            }
        }

        const maxHeight = window.innerHeight - overlayBarHeight - offset - kioskOffsetPx;

        scrollableEl.style.maxHeight = `${maxHeight}px`;
    };

    const debouncedUpdateScrollableHeight = debounce(updateScrollableHeight, 100);

    useEffect(() => {
        updateScrollableHeight();
        window.addEventListener("resize", debouncedUpdateScrollableHeight);

        const resizeObserver = new ResizeObserver(debouncedUpdateScrollableHeight);
        if (scrollable.current) resizeObserver.observe(scrollable.current);
        if (overlayBarRef.current) resizeObserver.observe(overlayBarRef.current);

        return () => {
            window.removeEventListener("resize", debouncedUpdateScrollableHeight);
            debouncedUpdateScrollableHeight.cancel();
            resizeObserver.disconnect();
        };
    }, [children]);

    const resetIdleTimer = useCallback(
        customDebounce(() => {
            window["__resett"]?.();
        }, 250),
        [uiState.kiosk],
    );

    return (
        <div
            className={`overlay-content ${className || ""}`}
            id="overlay-content"
            ref={contentRef}
            onClick={() => resetIdleTimer()}
        >
            {particles ? <OverlayParticles /> : null}
            {uiState.overlayPosition === "bottom" ? <OverlayGrip /> : null}
            <OverlayBar
                overlayBarStyle={overlayBarStyle}
                overlayBarCenterContent={overlayBarCenterContent}
                overlayBarEndContent={overlayBarEndContent}
                scrolled={scrolled}
                onClose={() => {
                    uiState.setInterruptAnimation();
                    onClose?.();
                }}
                hideClose={hideClose}
                backMode={backMode}
                onBack={onBack}
                ref={overlayBarRef}
            >
                {bar}
            </OverlayBar>

            <div
                className="overlay-content__scrollable"
                style={{
                    height: "auto",
                    display: uiState.overlayCollapsed ? "none" : undefined,
                }}
                ref={scrollable}
                onScroll={() => resetIdleTimer()}
            >
                {children}
                {/* FIX PART - make chrome start handling click events and correctly draw content (not sure why) */}
                <div style={{ visibility: "hidden", pointerEvents: "none", height: 0, position: "absolute", bottom: 0 }}></div>
            </div>
        </div>
    );
};

export default observer(OverlayContent);
