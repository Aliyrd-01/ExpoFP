import classNames from "classnames";
// TODO: RESTORE - only use what's needed from d3
import * as d3 from "d3";
import { ZoomTransform } from "d3";
import { event as currentEvent } from "d3-selection";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import { m4 } from "twgl.js";
import Rect from "../../core/Rect";
import store, { uiState } from "../../store";
import { Booth } from "../../store/BoothStore";
import logger from "../../tools/logger";
import getBoothIdFromClientXy from "./booth-by-xy";
import createDrawer, { Drawer } from "./drawing/Drawer1";
import "./Map.scss";
import { sizeCanvasToParentElement } from "./utils";
// import { overlayWidthRems, overlayMediumHeightRems } from '../sizes';
import zoomBound from "./zoom-bound";
import configInertia from "./zoom-inertia";
import { useReaction } from "../../utils/mobx";

export default function Map() {
    let zoomAf: number;
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
        get visibleRect() {
            const w = uiState.screenSize.width;
            const h = uiState.screenSize.height;
            const rect = Rect.fromX1y1x2y2(uiState.mapVisibleLeft, uiState.mapVisibleTop, w, h - uiState.mapVisibleBottom);
            return rect.withPadding(rect.w * 0.05, rect.h * 0.05);
        }
    }));

    // init
    useEffect(init, []);
    useReaction(
        () => uiState.devicePixelRatio,
        () => {
            s.drawer.setPixelRatio(uiState.devicePixelRatio);
        }
    );

    useReaction(
        () => s.visibleRect,
        () => {
            const v = s.visibleRect;
            logger.log("visibleRect change", v);
            s.drawer.setVisibleRect(v.scale(uiState.devicePixelRatio));
            // rezoom to make it fit bounds
            // this.$canvas.call(this.zoom.transform, d3.zoomTransform(this.$canvas.node()));
            zoomBoundCurrent();
        }
    );

    useReaction(
        () => uiState.centerMap,
        () => {
            if (!uiState.centerMap) return;
            uiState.centerMap = false;
            zoomTo(d3.zoomIdentity);
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
            const zoomScale = d3.zoomTransform(s.$canvas.node()).k; //m.getZoomTransform().k;
            const z = getTramsformToCenterSvgRect(r, s.visibleRect, Math.max(zoomScale, 1.2));
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
        s.$canvas = d3.select(el.current);
        //s.$canvas = d3.select(el.current);
        s.zoom = d3
            .zoom()
            .clickDistance(15)
            .interpolate(d3.interpolate)
            .scaleExtent([0.5, 12])
            .constrain((transform, extent, translateExtent) => zoomBound(s.drawer, transform, false))
            .on("zoom", () => {
                const t = currentEvent.transform;
                const isWheel = currentEvent.sourceEvent && currentEvent.sourceEvent.type === "wheel";
                // __logger.log('zoom', currentEvent, currentEvent.sourceEvent && currentEvent.sourceEvent.type);
                if (isWheel || s.animatePlease) setZoomTransformAnimated(t, 300, d3.easeExpOut);
                else if (t.animate) setZoomTransformAnimated(t, 500, d3.easeExpOut);
                else setZoomTransformAnimated(t, 0, null);
                s.animatePlease = false;
                s.moving = true;
            })
            .on("end", () => {
                s.moving = false;
            });

        configInertia(s.zoom);
        //m.setVisibleRect(this.visibleRect);
        sizeCanvasToParentElement(el.current);
        s.drawer = createDrawer(el.current, true);

        s.drawer.setVisibleRect((s.visibleRect as Rect).scale(uiState.devicePixelRatio));
        s.drawer.setPixelRatio(uiState.devicePixelRatio);
        window.addEventListener("resize", () => {
            // __logger.log('canvas change', canvas);
            sizeCanvasToParentElement(el.current);
            s.drawer.resetCanvasSize();
        });
        setZoomTransformAnimated(d3.zoomIdentity, 0, null);
        s.$canvas.call(s.zoom as any);
    }

    function raiseBoothOver(b: Booth) {
        if (s.prevBoothOver === b) return;
        s.prevBoothOver = b;
        uiState.hoveredBooth = b;
    }

    function handleMouseMoveAndOver(e) {
        const b = getBoothIdFromClientXy(e.clientX, e.clientY, s.drawer);
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
        const b = getBoothIdFromClientXy(e.clientX, e.clientY, s.drawer);
        logger.log("click", b);
        store.clickBooth(b);
    }

    function zoomTo(transform: ZoomTransform) {
        const t = d3.zoomTransform(s.$canvas.node());
        if (t.x === transform.x && t.y === transform.y && t.k === transform.k) return;
        (transform as any).animate = true;
        s.$canvas.call(s.zoom.transform as any, transform);
    }

    function zoomBoundCurrent() {
        const ct = d3.zoomTransform(s.$canvas.node());
        const nt = zoomBound(s.drawer, ct, false);
        if (nt !== ct) {
            // __logger.log('fixed bounds', ct, nt)
            zoomTo(nt);
        }
    }

    function setZoomTransformAnimated(t: ZoomTransform, duration: number, easingFunc: (k: number) => number) {
        // animate from existing position to dest
        if (zoomAf) cancelAnimationFrame(zoomAf);
        if (!duration) {
            s.drawer.setZoomTransform(t);
            return;
        }
        const ct = s.drawer.getZoomTransform();
        const i = d3.interpolate(ct, t);
        const start = performance.now();

        function animationStep() {
            const part = Math.min(1, (performance.now() - start) / duration);
            const easedPart = easingFunc ? easingFunc(part) : part;
            const val = i(easedPart);
            s.drawer.setZoomTransform(val);
            if (part !== 1) {
                zoomAf = requestAnimationFrame(animationStep);
            } else {
                logger.log("setZoomTransformAnimated ended", part);
            }
        }
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
        const t = d3.zoomIdentity.translate(diffX, diffY).scale(zoom); // { x: diffX, y: diffY, k: zoom };
        return zoomBound(s.drawer, t, true);
    }
}
