import React, { useRef, useEffect } from "react";
import "./Overlay.scss";
import { observer, useLocalStore } from "mobx-react-lite";
import store from "../store";
import logger from "../tools/logger";
import { remsToPixels } from "../utils";
import { OverlaySize } from "../store/UIState";
import Menu from "./Menu";
import Search from "./Search";
import Exhibitor from "./Exhibitor";
// TODO: RESTORE - only use what's needed from d3
import * as d3 from "d3";
import { autorun } from "mobx";
import Booth from "./Booth";
import Category from "./Category";
import Bookmarks from "./Bookmarks";
const { uiState } = store;

export default observer(function Overlay() {
    // const overlayPosition = "1";
    const el = useRef<HTMLDivElement>(null);

    const s = useLocalStore(() => ({
        startedTouch: undefined as Touch,
        touchDiff: undefined,
        currentTop: undefined,
        get noMove() {
            logger.log("noMove populate");
            return uiState.overlayPosition === "left";
        }
    }));

    useEffect(() => {
        logger.log("Overlay.useEffect");

        el.current.ontouchstart = handleTouchStart;
        el.current.ontouchmove = handleTouchMove;
        el.current.ontouchend = handleTouchEnd;
        el.current.ontouchcancel = handleTouchCancel;

        autorun(position);

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
            const rt = Array.from(e.changedTouches).filter(x => x.identifier === s.startedTouch.identifier)[0];
            if (!rt) return;
            s.touchDiff = s.startedTouch.clientY - rt.clientY;
            logger.log("TouchMove", s.touchDiff);
            setHeight();
        }

        function handleTouchEnd(e: TouchEvent) {
            if (s.noMove) return;
            if (!s.startedTouch) return;
            const rt = Array.from(e.changedTouches).filter(x => x.identifier === s.startedTouch.identifier)[0];
            if (!rt) return;
            let diff = s.startedTouch.clientY - rt.clientY;
            // if (this.negateMove) diff = -diff;
            const current = getTopForBottomPosition(uiState.overlaySize);
            const medium = getTopForBottomPosition("medium");
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

        function handleTouchCancel() {
            s.startedTouch = undefined;
        }

        function position() {
            const s = el.current.style;
            switch (uiState.overlayPosition) {
                case "left":
                    s.width = uiState.overlayWidthPx + "px";
                    s.top = "0";
                    s.left = "0";
                    s.height = undefined;
                    setShowAll();
                    break;
                case "bottom":
                    s.left = "0";
                    s.width = "100%";
                    setHeight();
                    break;
            }
        }

        function setShowAll() {
            const all =
                uiState.overlayPosition === "left" || getTopForBottomPosition("full") === el.current.getBoundingClientRect().top;
            uiState.overlayShowsAll = all;
        }

        function setHeight() {
            // height depends on size and ongoing touch
            // let's animate when no touch in progress
            if (uiState.overlayPosition === "left") return;

            let newTop = getTopForBottomPosition(uiState.overlaySize);

            let transition = true;
            if (s.touchDiff !== undefined) {
                newTop -= s.touchDiff;
                const maxTop = getTopForBottomPosition("small");
                const minTop = getTopForBottomPosition("full");
                newTop = Math.min(Math.max(newTop, minTop), maxTop);
                transition = false;
            } else if (s.currentTop === undefined) {
                transition = false;
            }
            if (s.currentTop === newTop) return;
            const $el = d3.select(el.current);
            $el.interrupt();
            if (transition) {
                $el.transition()
                    .ease(d3.easePolyOut)
                    .duration(500)
                    .style("top", newTop + "px")
                    .on("end", setShowAll);
            } else {
                el.current.style.top = newTop + "px";
            }
            setShowAll();

            if (s.currentTop !== newTop && window.event) window.event.preventDefault();
            s.currentTop = newTop;
        }
    }, [s]);

    console.log("Overlay rendered");
    return (
        <div className={`overlay ${uiState.overlaySize} ${uiState.overlayPosition}`} id="overlay" ref={el}>
            {s.noMove}
            <Menu />
            <Search />
            <Exhibitor />
            <Booth />
            <Bookmarks />
            <Category />
        </div>
    );
});

const miniSizeRems = 3.5;
const paddingRems = 2;
function getTopForBottomPosition(size: OverlaySize): number {
    // const containerHeight = el.parentElement.getBoundingClientRect().height;
    switch (size) {
        case "full":
            return remsToPixels(paddingRems);
        case "medium":
            return window.innerHeight - remsToPixels(uiState.overlayMediumHeightRems);
        case "small":
            return window.innerHeight - remsToPixels(miniSizeRems);
    }

    return null;
}
