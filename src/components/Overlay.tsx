import { easePolyOut } from "d3-ease";
import { select } from "d3-selection";
import { autorun, reaction } from "mobx";
import { observer, useLocalStore } from "mobx-react-lite";
import React, { useLayoutEffect, useRef } from "react";
import { uiState } from "../store";
import type { OverlaySize } from "../store/types";
import logger from "../tools/logger";
import { remsToPixels } from "../utils";
import Bookmarks from "./Bookmarks";
import Language from "./Language";
import Booth from "./Booth/Booth";
import Category from "./Category";
import Exhibitor from "./Exhibitor";
import Menu from "./Menu";
import "./Overlay.scss";
import Search from "./Search";
import Wayfinding from "./Wayfinding";
import Filter from "./Filter";
import classNames from "classnames";
import Agenda from "./Agenda";

interface OverlayProps {
    isGDPR: boolean;
    allowConsent?: boolean;
}

export default observer(function Overlay({ isGDPR, allowConsent }: OverlayProps) {
    // const overlayPosition = "1";
    const el = useRef<HTMLDivElement>(null);

    const s = useLocalStore(() => ({
        startedTouch: undefined as Touch,
        touchDiff: undefined,
        currentTop: undefined,
        // backdropStarted: false,
        get backdropClass() {
            let classes = "";
            if (uiState.canvasStarted && uiState.shouldUseBackdrop && !uiState.dimmed && !uiState.galleryActive) {
                classes += " -backdrop";
            }
            if (uiState.dimmed) {
                classes += " -no-transition";
            }
            if (uiState.galleryActive) {
                classes += " -gallery-active";
            }
            return classes;
            // if (!uiState.canvasStarted || !uiState.shouldUseBackdrop || uiState.dimmed) return "";
        },
        get noMove() {
            logger.log("noMove populate");
            return uiState.overlayPosition === "left";
        },

        get collapsed() {
            return uiState.overlayCollapsed ? "collapsed" : "";
        },

        get kiosk() {
            return uiState.kiosk ? "kiosk" : "";
        },
    }));

    // use useLayoutEffect for this thing to not jump
    useLayoutEffect(() => {
        if (!el.current) {
            return;
        }

        logger.log("Overlay.useEffect");

        el.current.addEventListener("touchstart", handleTouchStart, { passive: false });
        el.current.addEventListener("touchmove", handleTouchMove, { passive: false });
        el.current.addEventListener("touchend", handleTouchEnd, { passive: true });
        el.current.addEventListener("touchcancel", handleTouchCancel, { passive: true });

        const disposer = autorun(position);

        function handleTouchStart(e: TouchEvent) {
            if (s.noMove) return;
            logger.log("TouchStart", e);
            if (s.startedTouch) return;

            const scrollable = (e.target as any).closest(".overlay-content__scrollable");
            if (scrollable && scrollable.scrollTop > 0) return;
            s.startedTouch = e.touches[0];
        }

        function handleTouchMove(e: TouchEvent) {
            if (s.noMove) return;
            if (!s.startedTouch) return;
            const rt = Array.from(e.changedTouches).filter((x) => x.identifier === s.startedTouch.identifier)[0];
            if (!rt) return;
            s.touchDiff = s.startedTouch.clientY - rt.clientY;
            logger.log("TouchMove", s.touchDiff);
            setHeight();
            // doesn't allow to pass event further to HTML
            if (uiState.desiredOverlaySize !== "full") e.preventDefault();
        }

        function handleTouchEnd(e: TouchEvent) {
            if (s.noMove) return;
            if (!s.startedTouch) return;
            const rt = Array.from(e.changedTouches).filter((x) => x.identifier === s.startedTouch.identifier)[0];
            if (!rt) return;
            let diff = s.startedTouch.clientY - rt.clientY;
            // if (this.negateMove) diff = -diff;
            const current = getTopForBottomPosition(uiState.overlaySize, el.current);
            const medium = getTopForBottomPosition("medium", el.current);
            let newSize = uiState.overlaySize;
            if (diff < 0) {
                if (uiState.overlaySize === "medium" || current + diff > medium) newSize = "small";
                else if (uiState.overlaySize === "full") {
                    newSize = "medium";
                }
            } else if (diff > 0) {
                if (uiState.overlaySize === "medium" || current + diff < medium) newSize = "full";
                else if (uiState.overlaySize === "small") {
                    newSize = "medium";
                }
            }
            logger.log("TouchEnd", newSize);
            const touchDiff = s.touchDiff;
            s.startedTouch = undefined;
            s.touchDiff = undefined;
            if (Math.abs(touchDiff) > 10 && newSize !== uiState.overlaySize) {
                uiState.desiredOverlaySize = newSize;
            }
            // this will now transition to desired size
            position();
        }

        reaction(
            () => uiState.screenSize,
            () => {
                if (uiState.overlayPosition === "bottom" && uiState.overlaySize === "medium" && el.current) {
                    const top = getTopForBottomPosition("medium", el.current);
                    el.current.style.top = top + "px";
                }
            }
        );

        function handleTouchCancel() {
            s.startedTouch = undefined;
        }

        function position() {
            if (!el.current) {
                return;
            }

            const s = el.current.style;
            switch (uiState.overlayPosition) {
                case "left":
                    s.width = uiState.overlayWidthPx + "px";
                    s.top = uiState.headerHeightPx + 10 + "px";
                    s.left = "10px";
                    s.height = undefined;
                    setShowAll();
                    resetCurrentTop();
                    break;
                case "bottom":
                    s.left = "0";
                    s.width = "100%";
                    setHeight();
                    break;
            }
        }

        function resetCurrentTop() {
            s.currentTop = undefined;
        }

        function setShowAll() {
            if (!el.current) {
                return;
            }

            const all =
                uiState.overlayPosition === "left" || getTopForBottomPosition("full", el.current) + "px" === el.current.style.top;
            uiState.overlayShowsAll = all;
        }

        function setHeight() {
            if (!el.current) {
                return;
            }

            // height depends on size and ongoing touch
            // let's animate when no touch in progress
            if (uiState.overlayPosition === "left") return;

            let newTop = getTopForBottomPosition(uiState.overlaySize, el.current);

            let transition = true;
            if (s.touchDiff !== undefined) {
                newTop -= s.touchDiff;
                const maxTop = getTopForBottomPosition("small", el.current);
                const minTop = getTopForBottomPosition("full", el.current);
                newTop = Math.min(Math.max(newTop, minTop), maxTop);
                transition = false;
            } else if (s.currentTop === undefined) {
                transition = false;
            }
            if (s.currentTop === newTop) return;
            const $el = select(el.current);
            $el.interrupt();
            if (transition) {
                $el.transition()
                    .ease(easePolyOut)
                    .duration(500)
                    .style("top", newTop + "px")
                    .on("end", () => {
                        if (uiState.overlaySize === "full") {
                            const containerHeight =
                                el.current?.parentElement?.getBoundingClientRect?.()?.height || window.innerHeight;
                            el.current.style.height = `${containerHeight - newTop}px`;
                        }
                        setShowAll();
                    });
            } else {
                el.current.style.top = newTop + "px";
            }
            setShowAll();

            if (s.currentTop !== newTop && window.event) window.event.preventDefault();
            s.currentTop = newTop;
        }

        // window.setTimeout(() => {
        //     //const backdrop =  shouldUseBackdrop && uiState.overlayLeft && settings.EXPO === "aweusa2020";
        //     s.backdropStarted = true;
        // }, 3000);

        return () => {
            disposer();

            el.current?.removeEventListener("touchstart", handleTouchStart);
            el.current?.removeEventListener("touchmove", handleTouchMove);
            el.current?.removeEventListener("touchend", handleTouchEnd);
            el.current?.removeEventListener("touchcancel", handleTouchCancel);
        };
    }, [s]);

    return (
        <div
            className={classNames("overlay", s.backdropClass, uiState.overlaySize, {
                start: uiState.overlayPosition === "left",
                bottom: uiState.overlayPosition !== "left",
                [s.collapsed]: true,
                "overlay-pulse": uiState.kiosk && uiState.inIdle && !uiState.kioskSetup,
            })}
            id="overlay"
            ref={el}
        >
            {s.noMove}
            <Menu isGDPR={isGDPR} allowConsent={allowConsent} />
            <Search />
            <Exhibitor />
            <Booth />
            <Bookmarks />
            <Language />
            <Category />
            <Wayfinding />
            <Filter />
            <Agenda showFilters={true} />
        </div>
    );
});

const miniSizeRems = 3.5;
const paddingRems = 2;
function getTopForBottomPosition(size: OverlaySize, el: HTMLDivElement): number {
    const containerHeight = el?.parentElement?.getBoundingClientRect?.()?.height || window.innerHeight;
    switch (size) {
        case "full":
            return remsToPixels(paddingRems);
        case "medium":
            return containerHeight - remsToPixels(uiState.overlayMediumHeightRems);
        case "small":
            return containerHeight - remsToPixels(miniSizeRems);
    }

    return null;
}
