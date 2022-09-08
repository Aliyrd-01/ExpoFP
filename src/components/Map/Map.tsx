import classNames from "classnames";
import { easeExpOut } from "d3-ease";
import { interpolate } from "d3-interpolate";
import { select } from "d3-selection";
import { zoom, zoomIdentity, zoomTransform, ZoomTransform } from "d3-zoom";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import { m4 } from "twgl.js";
import Rect from "../../core/Rect";
import store, { uiState } from "../../store";
import { Booth, BoothBase } from "../../store/BoothStore";
import { Exhibitor } from "../../store/ExhibitorStore";
import { LayersMode } from "../../store/LayerStore";
import logger from "../../tools/logger";
import settings from "../../tools/settings";
import { t } from "../../utils/i18n";
import isIframe from "../../utils/is-iframe";
import isMac from "../../utils/is-mac";
import { useReaction } from "../../utils/mobx";
import getBoothIdFromClientXy from "./booth-by-xy";
import createDrawer, { Drawer } from "./drawing/Drawer1";
import "./Map.scss";
import { sizeCanvasToParentElement } from "./utils";
import zoomBound from "./zoom-bound";
import configInertia from "./zoom-inertia";

//console.log('isIframe', isIframe)

export default function Map() {
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
        drawer: null as Drawer,
        prevBoothOver: null as Booth,
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
            s.drawer.setPixelRatio(uiState.devicePixelRatio);
        }
    );

    // useReaction(
    //     () => uiState.canvasVisibleRectPx,
    //     ()=>{
    //         if (!s.drawer) return;
    //         const v = uiState.canvasVisibleRectPx;
    //         s.drawer.setVisibleRect(v.scale(uiState.devicePixelRatio));
    //         zoomBoundCurrent();
    //     }
    // );

    useReaction(
        () => [uiState.canvasVisibleRectPx, s.drawer],
        () => {
            if (!s.drawer) return;
            const v = uiState.canvasVisibleRectPx;
            logger.log("visibleRect change", v);
            s.drawer.setVisibleRect(v.scale(uiState.devicePixelRatio));
            // rezoom to make it fit bounds
            // this.$canvas.call(this.zoom.transform, zoomTransform(this.$canvas.node()));
            zoomBoundCurrent();
        },
        { fireImmediately: true }
    );

    useReaction(
        () => uiState.centerMap,
        () => {
            if (!uiState.centerMap) return;
            uiState.centerMap = false;
            var { rectangle } = store.layerStore;
            if (rectangle)
                zoomTo(
                    getTramsformToCenterSvgRect(
                        rectangle,
                        uiState.canvasVisibleRectPx,
                        Math.max(zoomTransform(s.$canvas.node()).k, 4)
                    )
                );
            else zoomTo(zoomIdentity);
        }
    );

    useReaction(
        () => uiState.zoomBy,
        () => {
            if (!uiState.zoomBy) return;
            const z = uiState.zoomBy;
            uiState.zoomBy = null;
            s.animatePlease = true;
            s.$canvas.call(s.zoom.scaleBy as any, z);
        }
    );

    useReaction(
        () => uiState.details,
        () => {
            if (!uiState.onDetails) return;
            if (!uiState.details) {
                uiState.onDetails(null);
                return;
            }

            var details = uiState.details as any;
            var data = {
                type:
                    uiState.details instanceof BoothBase
                        ? "booth"
                        : uiState.details instanceof Exhibitor
                        ? "exhibitor"
                        : ("route" as any),
                name: details?.name,
                id: details?.id,
                externalId: details?.externalId,
            };

            uiState.onDetails(data);
        }
    );

    useReaction(
        () => uiState.moveToRect,
        () => {
            if (!uiState.moveToRect) return;
            if (
                uiState.moveToRect &&
                uiState.moveToRect.h !== Infinity &&
                uiState.moveToRect.w !== Infinity &&
                uiState.moveToRect.h > 0 &&
                uiState.moveToRect.w > 0
            ) {
                moveToRect(uiState.moveToRect, 30 /*store.layerStore.mode !== LayersMode.Radio*/);
            }
            uiState.moveToRect = null;
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
            const rects = uiState.moveToBooths.filter((b) => b.rect).map((b) => b.rect) as Rect[];
            if (rects.length === 0) return;
            moveToRect(Rect.fromMultiple(rects));
            uiState.moveToBooths = null;

            // store.commit("setMoveToBooths", null);
            // this.handledMoveToExhibitor = null;
        }
    );

    useReaction(
        () => store.layerStore.visible,
        () => {
            store.layerStore.layers.forEach((layer) => s.drawer.setPainterVisibility(layer.name, layer.visible));
            //if (store.layerStore.mode !== LayersMode.Radio)
            s.drawer.draw();
        }
    );

    // useReaction(
    //     () => store.layerStore.rectangle,
    //     () => {
    //         uiState.moveToRect = store.layerStore.rectangle;
    //     }
    // );

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

    function moveToRect(rect: Rect, maxZoomScale: number = 4, animate: boolean = true) {
        if (settings.EXPO === "springfair2022") maxZoomScale = 20;
        const zoomScale = zoomTransform(s.$canvas.node()).k; //m.getZoomTransform().k;
        const z = getTramsformToCenterSvgRect(rect, uiState.canvasVisibleRectPx, Math.max(zoomScale, maxZoomScale));
        zoomTo(z, animate);
    }

    function init() {
        s.$canvas = select(el.current);

        s.zoom = zoom()
            .clickDistance(15)
            .interpolate(interpolate)
            .scaleExtent([0.1, 35])
            .constrain((transform, extent, translateExtent) => zoomBound(s.drawer, transform, false))
            .filter(function (currentEvent) {
                if (!isIframe || !currentEvent || currentEvent.type !== "wheel")
                    // && currentEvent.type !== "touchstart"
                    return true;

                const preventWheel = currentEvent.type === "wheel" && !currentEvent.ctrlKey && !currentEvent.metaKey;
                //||(currentEvent.type === "touchstart" && currentEvent.touches.length < 2);

                if (preventWheel) {
                    // if (currentEvent.type === "touchstart") {
                    //     scheduleMessage("Use two fingers to move", 500);
                    // } else

                    // EFP-294 Disable "Use ctrl+scroll" to zoom (message and fade, but still lock scroll) - ebpomlondon2020
                    if (window["__efpEvent"] !== "ebpomlondon2020") {
                        uiState.largeMessage = t("Use {{keyCode}} + scroll to zoom", { keyCode: isMac ? "⌘" : "Ctrl" });
                        uiState.largeMessageLastSet = performance.now();
                    }
                }

                return !preventWheel;
            })
            .on("zoom", (currentEvent) => {
                if (window["__resett"]) window["__resett"]();
                const t = currentEvent.transform;
                const isWheel = currentEvent.sourceEvent && currentEvent.sourceEvent.type === "wheel";
                if (isWheel || s.animatePlease) setZoomTransformAnimated(t, 300, easeExpOut);
                //s.drawer.setZoomTransform(t);
                else if (t.animate) setZoomTransformAnimated(t, 500, easeExpOut);
                else setZoomTransformAnimated(t, 0, null);
                s.animatePlease = false;
                s.moving = true;
                uiState.zoomAfTransformK = Math.round(t.k * 100) / 100;
            })
            .on("end", () => {
                s.moving = false;
            });

        configInertia(s.zoom);
        //m.setVisibleRect(thiuiState.canvasVisibleRectPx);
        sizeCanvasToParentElement(el.current);
        s.drawer = createDrawer(el.current, true);

        // s.drawer.setVisibleRect((uiState.canvasVisibleRectPx as Rect).scale(uiState.devicePixelRatio));
        s.drawer.setPixelRatio(uiState.devicePixelRatio);
        window.addEventListener("resize", () => {
            // __logger.log('canvas change', canvas);
            sizeCanvasToParentElement(el.current);
            s.drawer.resetCanvasSize();
        });
        setZoomTransformAnimated(zoomIdentity, 0, null);
        s.$canvas.call(s.zoom as any);

        if (store.fp.onFpConfigured) store.fp?.onFpConfigured();
    }

    function raiseBoothOver(b: Booth) {
        if (s.prevBoothOver === b) return;
        s.prevBoothOver = b;
        uiState.hoveredBooth = b;
    }

    function handleMouseMoveAndOver(e) {
        const b = getBoothIdFromClientXy(e.clientX, e.clientY, s.drawer);
        // console.log("handleMouseMoveAndOver", b);
        raiseBoothOver(b);
    }

    function handleMouseOut(e) {
        raiseBoothOver(undefined);
    }

    function handleClick(e: React.MouseEvent) {
        if (window["__resett"]) window["__resett"]();
        if (uiState.overlayPosition === "bottom" && uiState.overlaySize === "full") {
            store.showMap();
        }
        // if (!this.props.onBoothClick) return;
        const b = getBoothIdFromClientXy(e.clientX, e.clientY, s.drawer);
        logger.log("click", b);
        store.clickBooth(b);
    }

    function zoomTo(transform: ZoomTransform, animate: boolean = true) {
        const t = zoomTransform(s.$canvas.node());
        if (t.x === transform.x && t.y === transform.y && t.k === transform.k) return;
        (transform as any).animate = animate;
        s.$canvas.call(s.zoom.transform as any, transform);
    }

    function zoomBoundCurrent() {
        const ct = zoomTransform(s.$canvas.node());
        const nt = zoomBound(s.drawer, ct, false);
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
            // s.drawer.setZoomTransform(zoomAfTransform);
        }
        if (!duration) {
            zoomAfTransform = undefined;
            s.drawer.setZoomTransform(t);
            return;
        }
        const ct = zoomAfTransform || s.drawer.getZoomTransform();
        const i = interpolate(ct, t);
        const start = performance.now();

        function animationStep() {
            const part = Math.min(1, (performance.now() - start) / duration);
            const easedPart = easingFunc ? easingFunc(part) : part;
            const val = i(easedPart);
            s.drawer.setZoomTransform(val);
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

        const svgPxMatrix = s.drawer.getSvgPxUnzoomedMatrix();

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
        return zoomBound(s.drawer, t, true);
    }
}
