import classNames from "classnames";
import { easeExpOut } from "d3-ease";
import { interpolate, interpolateNumber } from "d3-interpolate";
import { event as currentEvent, select } from "d3-selection";
import { zoom, zoomIdentity, zoomTransform, ZoomTransform } from "d3-zoom";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React, { useEffect, useMemo, useRef } from "react";
import { m4 } from "twgl.js";
import { Booth } from "../../core/Booth";
import Rect from "../../core/Rect";
import DrawerAdapter from "../../drawing/DrawerAdapter";
import Matrix from "../../drawing/Matrix";
// import store, { uiState } from "../../store";
// import { Booth } from "../../store/BoothStore";
import logger from "../../tools/logger";
import { useFp, useStore, useUiState } from "../../tools/use";
import animate from "../../utils/animate";
import isIframe from "../../utils/is-iframe";
import isMac from "../../utils/is-mac";
import { useReaction } from "../../utils/mobx";
import createBoothIdFromClientXyFunc from "./booth-by-xy";
// import createDrawer, { Drawer } from "./drawing/Drawer1";
import "./Map.scss";
import { sizeToParentElement } from "./utils";
import zoomBound from "./zoom-bound";
import configInertia from "./zoom-inertia";

//console.log('isIframe', isIframe)

export default function Map() {
    const store = useStore();
    const uiState = useUiState();
    const fp = useFp();

    const boothIdByXy = useMemo(() => createBoothIdFromClientXyFunc(store.boothStore.booths), [store]);

    let zoomAf: number;
    let zoomAfTransform: ZoomTransform;
    // do not use useState unless really needed
    const el = useRef<HTMLCanvasElement>();
    // use mobx for everything
    const s = useLocalStore(() => ({
        animatePlease: false,
        moving: false,
        $canvas: null as d3.Selection<HTMLCanvasElement, unknown, null, undefined>,
        zoom: null as d3.ZoomBehavior<Element, unknown>,
        drawer: null as DrawerAdapter,
        matrix: null as Matrix,
        prevBoothOver: null as Booth
        // get visibleRect() {
        //     const rect = uiState.canvasVisibleRectPx
        //     return  rect;//rect.withPadding(rect.w * 0.05, rect.h * 0.05);
        // }
    }));

    // init
    useEffect(init, []);
    useReaction(
        () => uiState.devicePixelRatio,
        () => {
            s.matrix.setPixelRatio(uiState.devicePixelRatio);
            zoomBoundCurrent();
        }
    );
    useReaction(
        () => uiState.canvasVisibleRectPt,
        () => {
            s.matrix.setVisibleRect(uiState.canvasVisibleRectPt);
            zoomBoundCurrent();
        }
    );

    // useReaction(
    //     () => uiState.canvasVisibleRectPx,
    //     ()=>{
    //         if (!s.matrix) return;
    //         const v = uiState.canvasVisibleRectPx;
    //         s.matrix.setVisibleRect(v.scale(uiState.devicePixelRatio));
    //         zoomBoundCurrent();
    //     }
    // );

    // useReaction(
    //     () => [uiState.canvasVisibleRectPt, s.matrix],
    //     () => {
    //         if (!s.matrix) return;
    //         const v = uiState.canvasVisibleRectPx;
    //         logger.log("visibleRect change", v);
    //         s.matrix.setVisibleRect(v.scale(uiState.devicePixelRatio));
    //         // rezoom to make it fit bounds
    //         // this.$canvas.call(this.zoom.transform, zoomTransform(this.$canvas.node()));
    //         zoomBoundCurrent();
    //     },
    //     { fireImmediately: true }
    // );

    useReaction(
        () => uiState.centerMap,
        () => {
            if (!uiState.centerMap) return;
            uiState.centerMap = false;
            zoomTo(zoomIdentity);
        }
    );

    useReaction(
        () => uiState.zoomBy,
        () => {
            if (!uiState.zoomBy) return;
            const z = uiState.zoomBy;
            uiState.zoomBy = null;
            s.animatePlease = true;
            s.$canvas.call(s.zoom.scaleBy as any, z === -1 ? 0.66 : 1.5);
        }
    );

    useReaction(
        () => uiState.moveToBooths,
        () => {
            logger.log("this.moveToBooths", uiState.moveToBooths);
            if (!uiState.moveToBooths) return;
            //this.handledMoveToExhibitor = uiState.moveToBooths;
            logger.log("watched moveToBooths", uiState.moveToBooths);
            // // ask map to move to this exhibitor
            const rects = uiState.moveToBooths.map(b => b.rect) as Rect[];
            if (rects.length === 0) return;
            const r = Rect.fromMultiple(rects);
            const zoomScale = zoomTransform(s.$canvas.node()).k; //m.getZoomTransform().k;
            const z = getTramsformToCenterSvgRect(r, uiState.canvasVisibleRectPx, Math.max(zoomScale, 4));
            zoomTo(z);

            uiState.moveToBooths = null;
            // store.commit("setMoveToBooths", null);
            // this.handledMoveToExhibitor = null;
        }
    );

    return useObserver(() => (
        <canvas
            ref={el}
            className={classNames({ map: true, moving: s.moving })}
            onMouseMove={handleMouseMoveAndOver}
            onClick={handleClick}
            onMouseOver={handleMouseMoveAndOver}
            onMouseOut={handleMouseOut}
        >
            ExpoFP.com
        </canvas>
    ));

    function init() {
        s.$canvas = select(el.current);
        s.matrix = new Matrix(
            uiState.canvasSizePt,
            uiState.canvasVisibleRectPt,
            0,
            fp.svg.area as Rect,
            zoomIdentity,
            uiState.devicePixelRatio
        );

        window.setTimeout(() => {
            animate(
                0,
                1000,
                easeExpOut,
                interpolateNumber(0, 1),
                window.requestAnimationFrame,
                v => s.matrix.setVisibleScale(v),
                () => {
                    uiState.canvasStarted = true;
                }
            );
        }, 400);

        s.zoom = zoom()
            .clickDistance(15)
            .interpolate(interpolate)
            .scaleExtent([0.1, 12])
            .constrain((transform, extent, translateExtent) => zoomBound(fp.svg, s.matrix, transform, false))
            .filter(function() {
                if (!isIframe || !currentEvent || currentEvent.type !== "wheel")
                    // && currentEvent.type !== "touchstart"
                    return true;

                const preventWheel = currentEvent.type === "wheel" && !currentEvent.ctrlKey && !currentEvent.metaKey;
                //||(currentEvent.type === "touchstart" && currentEvent.touches.length < 2);

                if (preventWheel) {
                    // if (currentEvent.type === "touchstart") {
                    //     scheduleMessage("Use two fingers to move", 500);
                    // } else

                    if (isMac) {
                        uiState.largeMessage = "Use ⌘ + scroll to zoom";
                    } else {
                        uiState.largeMessage = "Use Ctrl + scroll to zoom";
                    }
                    uiState.largeMessageLastSet = performance.now();
                }

                return !preventWheel;
            })
            .on("zoom", () => {
                const t = currentEvent.transform;
                const isWheel = currentEvent.sourceEvent && currentEvent.sourceEvent.type === "wheel";
                if (isWheel || s.animatePlease) setZoomTransformAnimated(t, 300, easeExpOut);
                //s.matrix.setZoomTransform(t);
                else if (t.animate) setZoomTransformAnimated(t, 500, easeExpOut);
                else setZoomTransformAnimated(t, 0, null);
                s.animatePlease = false;
                s.moving = true;
            })
            .on("end", () => {
                s.moving = false;
            });

        configInertia(s.zoom);
        //m.setVisibleRect(thiuiState.canvasVisibleRectPx);
        sizeToParentElement(el.current);
        // s.matrix = new Matrix(new Size(el.current.width, el.current.height).scale(uiState.devicePixelRatio));
        s.drawer = new DrawerAdapter(fp, el.current, s.matrix);

        // s.matrix.setVisibleRect((uiState.canvasVisibleRectPx as Rect).scale(uiState.devicePixelRatio));
        s.matrix.setPixelRatio(uiState.devicePixelRatio);
        window.addEventListener("resize", () => {
            // __logger.log('canvas change', canvas);
            sizeToParentElement(el.current);
            // Below commented, because now we will use ResizeObserver
            // s.drawer.resetCanvasSize();
        });
        setZoomTransformAnimated(zoomIdentity, 0, null);
        s.$canvas.call(s.zoom as any);
    }

    function raiseBoothOver(b: Booth) {
        if (s.prevBoothOver === b) return;
        s.prevBoothOver = b;
        uiState.hoveredBooth = b;
    }

    function handleMouseMoveAndOver(e) {
        const b = boothIdByXy(e.clientX, e.clientY, s.matrix);
        // console.log("handleMouseMoveAndOver", b);
        raiseBoothOver(b);
    }

    function handleMouseOut(e) {
        raiseBoothOver(undefined);
    }

    function handleClick(e: React.MouseEvent) {
        if (uiState.overlayPosition === "bottom" && uiState.overlaySize === "full") {
            store.showMap();
        }
        // if (!this.props.onBoothClick) return;
        const b = boothIdByXy(e.clientX, e.clientY, s.matrix);
        logger.log("click", b);
        store.clickBooth(b);
    }

    function zoomTo(transform: ZoomTransform) {
        const t = zoomTransform(s.$canvas.node());
        if (t.x === transform.x && t.y === transform.y && t.k === transform.k) return;
        (transform as any).animate = true;
        s.$canvas.call(s.zoom.transform as any, transform);
    }

    function zoomBoundCurrent() {
        const ct = zoomTransform(s.$canvas.node());
        const nt = zoomBound(fp.svg, s.matrix, ct, false);
        if (nt !== ct) {
            // __logger.log('fixed bounds', ct, nt)
            zoomTo(nt);
        }
    }

    function setZoomTransformAnimated(t: ZoomTransform, duration: number, easingFunc: (k: number) => number) {
        // animate from existing position to dest
        if (zoomAf) {
            // move to the last frame zoom transform
            cancelAnimationFrame(zoomAf);
            // s.matrix.setZoomTransform(zoomAfTransform);
        }
        if (!duration) {
            zoomAfTransform = undefined;
            s.matrix.setZoomTransform(t);
            return;
        }
        const ct = zoomAfTransform || s.matrix.getZoomTransform();
        const i = interpolate(ct, t);
        const start = performance.now();

        function animationStep() {
            const part = Math.min(1, (performance.now() - start) / duration);
            const easedPart = easingFunc ? easingFunc(part) : part;
            const val = i(easedPart);
            s.matrix.setZoomTransform(val);
            if (part !== 1) {
                zoomAf = requestAnimationFrame(animationStep);
            } else {
                zoomAf = undefined;
                zoomAfTransform = undefined;
                logger.log("setZoomTransformAnimated ended", part);
            }
        }
        zoomAfTransform = t;
        animationStep();
    }

    function getTramsformToCenterSvgRect(svgRect: Rect, vRect: Rect, maxZoom: number) {
        const minPaddingPercent = 5;

        const targetRect = vRect.withPadding((vRect.w * minPaddingPercent) / 100, (vRect.h * minPaddingPercent) / 100);

        const svgPxMatrix = s.matrix.getSvgPxUnzoomedMatrix();

        const xy1 = m4.transformPoint(svgPxMatrix, [svgRect.x1, svgRect.y1, 1], null);
        const x1 = xy1[0],
            y1 = xy1[1];
        const xy2 = m4.transformPoint(svgPxMatrix, [svgRect.x2, svgRect.y2, 1], null);
        const x2 = xy2[0],
            y2 = xy2[1];
        const bSvgRect = Rect.fromX1y1x2y2(x1, y1, x2, y2);

        // __logger.log(bSvgRect.w, bSvgRect.h, bSvgRect);

        // get max zoom
        const zoom = Math.min(targetRect.w / bSvgRect.w, targetRect.h / bSvgRect.h, maxZoom);

        const diffX = targetRect.cx - bSvgRect.cx * zoom;
        const diffY = targetRect.cy - bSvgRect.cy * zoom;
        const t = zoomIdentity.translate(diffX, diffY).scale(zoom); // { x: diffX, y: diffY, k: zoom };
        return zoomBound(fp.svg, s.matrix, t, true);
    }
}
