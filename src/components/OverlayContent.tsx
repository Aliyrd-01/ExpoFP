import { observer } from "mobx-react-lite";
import PerfectScrollbar from "perfect-scrollbar";
import React, { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { uiState } from "../store";
import isScrollUgly from "../utils/is-scroll-ugly";
import OverlayBar from "./OverlayBar";
import "./OverlayContent.scss";
import OverlayGrip from "./OverlayGrip";
import OverlayParticles from "./OverlayParticles";

const OverlayContent: React.FC<{
    bar: ReactNode;
    className?: string;
    particles?: boolean;
    backMode: "back" | "menu" | "none";
    hideClose?: boolean;
    onBack?: () => void;
    onClose: () => void;
    onUpdateFuncSet?: (s: () => void) => void;
    passRefToParent?: (el: React.RefObject<HTMLDivElement>) => void;
}> = ({ bar, className, particles, backMode, hideClose, onBack, onClose, children, onUpdateFuncSet, passRefToParent }) => {
    const [scrolled, setScrolled1] = useState(false);
    const scrollable = useRef<HTMLDivElement>();
    const [psInstance, setPsInstance] = useState<PerfectScrollbar>(null);
    const contentRef = useRef<HTMLDivElement>();

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
    }, [scrollable, onUpdateFuncSet, psInstance]);

    useEffect(() => {
        if (uiState.overlaySize !== "full" && scrollable.current.scrollTop !== 0) {
            scrollable.current.scrollTop = 0;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uiState.overlaySize]);

    return (
        <div className={`overlay-content ${className || ""}`} id="overlay-content" ref={contentRef}>
            {particles ? <OverlayParticles /> : null}
            {uiState.overlayPosition === "bottom" ? <OverlayGrip /> : null}
            <OverlayBar scrolled={scrolled} onClose={onClose} hideClose={hideClose} backMode={backMode} onBack={onBack}>
                {bar}
            </OverlayBar>

            <div
                className={`overlay-content__scrollable`}
                style={{
                    height: uiState.kiosk ? "auto" : undefined,
                    display: uiState.overlayCollapsed ? "none" : undefined,
                }}
                ref={scrollable}
            >
                {children}
                {/* FIX PART - make chrome start handling click events and correctly draw content (not sure why) */}
                <div style={{ visibility: "hidden", pointerEvents: "none", height: 0, position: "absolute", bottom: 0 }}></div>
            </div>
        </div>
    );
};

export default observer(OverlayContent);
