import classNames from "classnames";
import { easeExpOut } from "d3-ease";
import { interpolate } from "d3-interpolate";
import { select } from "d3-selection";
import { zoom, zoomIdentity, zoomTransform, ZoomTransform } from "d3-zoom";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import { ResizeObserver } from "resize-observer";
import { m4 } from "twgl.js";
import Rect from "../../core/Rect";
import { svgArea } from "../../data/svg";
import store, { uiState } from "../../store";
import { Booth, BoothBase } from "../../store/BoothStore";
import { Category } from "../../store/CategoryStore";
import { Exhibitor } from "../../store/ExhibitorStore";
import { LayerMode } from "../../store/LayerStore";
import { Route } from "../../store/RouteStore";
import logger from "../../tools/logger";
import settings from "../../tools/settings";
import { t } from "../../utils/i18n";
import isIframe from "../../utils/is-iframe";
import isMac from "../../utils/is-mac";
import { useReaction } from "../../utils/mobx";
import getBoothIdFromClientXy from "./booth-by-xy";
import createDrawer, { Drawer, DrawerImpl } from "./drawing/Drawer1";
import "./Map.scss";
import { getMarkerFromClientXy } from "./marker-by-xy";
import { sizeCanvasToParentElement } from "./utils";
import zoomBound from "./zoom-bound";
import configInertia from "./zoom-inertia";
import ImagePainter from "./drawing/painters/ImagePainter";
import isMobile from "../../utils/is-mobile";
import isWebview from "../../utils/is-webview";
import { areLayersEnabled } from "../../utils/areLayersEnabled";
import { convertGpsToLocal } from "../../utils/gps";
import { fpGeo } from "../Mapbox/utils/fpGeo";
import { reaction } from "mobx";

//console.log('isIframe', isIframe)

export default function Map() {
    let zoomAf: number;
    let zoomAfTransform: ZoomTransform;
    // do not use useState unless really needed
    const el = useRef<HTMLCanvasElement>();
    const resizeObserverRef = useRef<ResizeObserver>();
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
    useEffect(() => {
        init();

        store.fp.getCenterCoordinates = getCenterCoordinates;

        return () => resizeObserverRef.current.disconnect();
    }, []);

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
            if (!uiState.centerMap || store.mapboxStore.showMapbox) return;
            uiState.centerMap = false;
            // var { rectangle } = store.layerStore;
            // if (rectangle)
            //     zoomTo(
            //         getTramsformToCenterSvgRect(
            //             rectangle,
            //             uiState.canvasVisibleRectPx,
            //             Math.max(zoomTransform(s.$canvas.node()).k, 4)
            //         )
            //     );
            // else 
            zoomTo(zoomIdentity);
        }
    );

    useReaction(
        () => uiState.zoomBy,
        () => {
            if (!uiState.zoomBy || store.mapboxStore.showMapbox) return;
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

            // @todo clear after event is complete
            if (settings.EXPO === "wineparis") {
                if (details instanceof Exhibitor) details = details.booths[0];
                if (!details) return;
            }
            //

            let type = null;
            let boothsNames = [];

            if (details instanceof Exhibitor) {
                type = "exhibitor";
                boothsNames = details.booths
                    .map((b) => b.name)
                    .sort((b1, b2) =>
                        b1 == store.routeStore.tempToBooth?.name ? -1 : b2 == store.routeStore.tempToBooth?.name ? 1 : 0
                    );
            } else if (details instanceof BoothBase) {
                type = "booth";
                boothsNames = [details.name];
            } else if (details instanceof Route) {
                type = "route";
                boothsNames = [details.from?.name, details.to?.name].filter((name) => !!name);
            } else if (details instanceof Category) {
                type = "category";
                boothsNames = details.exhibitors.map((e) => e.booths.map((b) => b.name)).flat();
            }

            var data = {
                type: type,
                name: details?.name,
                id: details?.id,
                externalId: details?.externalId,
                boothsNames: boothsNames,
            };

            setTimeout(() => uiState.onDetails(data), 400);
        }
    );

    useReaction(
        () => uiState.moveToRect,
        () => {
            if (!uiState.moveToRect || store.mapboxStore.showMapbox) return;
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
            if (!uiState.moveToBooths || store.mapboxStore.showMapbox) return;
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

    useReaction(
        () => ({
            highlightedBooths: store.uiState.highlightedBooths,
            hideLogo: store.uiState.hideLogoInBooth,
            booths: store.boothStore.booths,
        }),
        ({ highlightedBooths, hideLogo, booths }) => {
            // TODO: Remove this check after the issue is resolved.
            // Mobile Safari freezes when trying to highlight booths.
            if ((isMobile || isWebview) && !hideLogo && booths.filter((b) => b.noLabels).length > 500) return;

            (s.drawer as DrawerImpl).allPainters
                .filter(p => p instanceof ImagePainter)
                .forEach(
                    p => (p as ImagePainter)?.setDimmingForObjects?.(objectId => highlightedBooths.has(objectId)),
            );
        }
    );

    useReaction(
        () => uiState.interruptAnimation,
        () => {
            cancelAnimationFrame(zoomAf);
            s.$canvas.interrupt();
        },
    );

    useEffect(() => {
        const disposer = reaction(
            () => uiState.mapSettings,
            ({ center, centerxy, zoom }) => {
                try {
                    if (store.mapboxStore.showMapbox) {
                        return;
                    }

                    let coords: { x: number, y: number };
                    if (center) {
                        const point = center.split(",").map(Number);
                        coords = convertGpsToLocal(point[0], point[1], fpGeo.properties.config);
                    } else if (centerxy) {
                        const point = centerxy.split(",").map(Number);
                        coords = { x: point[0], y: point[1] };
                    }

                    function panTo(targetX: number, targetY: number, zoomLevel?: number) {
                        const canvas = s.$canvas.node();
                        const currentTransform = zoomTransform(canvas);
                        const k = zoomLevel != null ? zoomLevel : currentTransform.k;

                        const newX = canvas.clientWidth / 2 - targetX * k;
                        const newY = canvas.clientHeight / 2 - targetY * k;
                        const newTransform = zoomIdentity.translate(newX, newY).scale(k);

                        s.$canvas.call(s.zoom.transform as any, newTransform);
                    }

                    function applyZoom(newZoom: number) {
                        const canvas = s.$canvas.node();
                        const currentTransform = zoomTransform(canvas);

                        const centerX = (canvas.clientWidth / 2 - currentTransform.x) / currentTransform.k;
                        const centerY = (canvas.clientHeight / 2 - currentTransform.y) / currentTransform.k;

                        panTo(centerX, centerY, newZoom);
                    }

                    if (coords) {
                        const pxToSvgMatrix = s.drawer.getPxSvgMatrix();
                        const svgToPxMatrix = m4.inverse(pxToSvgMatrix);
                        const [x, y] = m4.transformPoint(svgToPxMatrix, [coords.x, coords.y, 1]);
                        panTo(x, y, zoom);
                    } else if (zoom) {
                        applyZoom(zoom);
                    }
                } catch (err) {
                    console.error(err);
                }
            },
        );

        return () => disposer();
    }, []);

    return useObserver(() => (
        <canvas
            ref={el}
            className={classNames({ map: true, moving: s.moving, hidden: store.mapboxStore.showMapbox })}
            onMouseMove={handleMouseMoveAndOver}
            onClick={handleClick}
            onMouseOver={handleMouseMoveAndOver}
            onMouseOut={handleMouseOut}
        >
            ExpoFP.com
        </canvas>
    ));

    function moveToRect(rect: Rect, maxZoomScale: number = 10, animate: boolean = true) {
        let newRect = Rect.fromX1y1x2y2(rect.x1 - uiState.kioskRectPadding * rect.w, rect.y1, rect.x2, rect.y2);

        if (settings.EXPO === "springfair2022") maxZoomScale = 20;
        const zoomScale = zoomTransform(s.$canvas.node()).k; //m.getZoomTransform().k;

        let visibleRect = uiState.canvasVisibleRectPx;
        if (
            uiState.kioskSetupData
            && (
                areLayersEnabled()
                    ? store.routeStore.defaultFrom?.layer?.name === store.routeStore.currentRouteLayer?.name
                    : true
            )
        ) {
            visibleRect = Rect.fromX1y1x2y2(
                uiState.mapVisibleStart,
                visibleRect.y1,
                visibleRect.x2,
                visibleRect.y2,
            );
            newRect = Rect.fromMultiple([
                newRect,
                Rect.fromXywh(uiState.kioskSetupData.x, uiState.kioskSetupData.y, 1, 1)
            ]);
        }

        const z = getTramsformToCenterSvgRect(newRect, visibleRect, Math.max(zoomScale, maxZoomScale));
        zoomTo(z, animate);
    }

    function init() {
        s.$canvas = select(el.current);
        s.zoom = zoom()
            .clickDistance(15)
            .interpolate(interpolate)
            .scaleExtent([0.1, svgArea.w > 100000 ? 100 : 35])
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
                else if (t.animate) setZoomTransformAnimated(t, uiState.mapSettings.zoomtime ?? 500, easeExpOut);
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

        const resizeObserver = new ResizeObserver(() => {
            sizeCanvasToParentElement(el.current);
            s.drawer.resetCanvasSize();

            if (settings.EXPO === "ess-expo") {
                setTimeout(() => {
                    if (uiState.selectedBooths) store.moveToList(Array.from(uiState.selectedBooths));
                }, 100);
            }
        });

        resizeObserverRef.current = resizeObserver;

        resizeObserver.observe(uiState.rootElement);

        setZoomTransformAnimated(zoomIdentity, 0, null);
        s.$canvas.call(s.zoom as any);

        if (store.fp.onFpConfigured) store.fp?.onFpConfigured();
    }

    function raiseBoothOver(b: Booth) {
        if (s.prevBoothOver === b) return;
        s.prevBoothOver = b;
        uiState.hoveredBooth = b;
    }

    function getCenterCoordinates() {
        const { width, height } = s.$canvas.node().getBoundingClientRect();

        const activeLayer = store.layerStore.visible.find(
            (layer) => layer.mode === LayerMode.TurnedOff || layer.mode === LayerMode.TurnedOn
        );
        const z = activeLayer?.name || null;

        const centerX = width / 2;
        const centerY = height / 2;

        const pxSvgMatrix = s.drawer.getPxSvgMatrix();
        const [x, y] = m4.transformPoint(pxSvgMatrix, [centerX, centerY, 0]);

        return { x, y, z };
    }

    function handleMouseMoveAndOver(e) {
        if (!uiState?.rootElement || !s?.drawer || uiState.kioskSetup) return;

        const { left, top } = uiState.rootElement.getBoundingClientRect();

        const x = e.clientX - left;
        const y = e.clientY - top;

        const b = getBoothIdFromClientXy(x, y, s.drawer);
        // console.log("handleMouseMoveAndOver", b);
        raiseBoothOver(b);
    }

    function handleMouseOut(e) {
        raiseBoothOver(undefined);
    }

    function handleClick(e: React.MouseEvent) {
        if (!uiState?.rootElement || !s?.drawer) return;

        if (window["__resett"]) window["__resett"]();
        if (uiState.overlayPosition === "bottom" && uiState.overlaySize === "full") {
            store.showMap();
        }

        const { left, top } = uiState.rootElement.getBoundingClientRect();

        const x = e.clientX - left;
        const y = e.clientY - top;

        if (uiState.onGetCoordsClick) {
            const pxSvgMatrix = s.drawer.getPxSvgMatrix();
            const xys = m4.transformPoint(pxSvgMatrix, [x, y, 1], null);
            const currentFloor = store.layerStore.layers.find(
                (l) => l.visible && (l.mode === LayerMode.TurnedOn || l.mode === LayerMode.TurnedOff)
            );

            uiState.onGetCoordsClick({ x: xys[0], y: xys[1], z: currentFloor?.name || null });
        }

        if (uiState.kioskSetup) {
            return;
        }

        if (uiState.onMarkerClick) {
            const marker = getMarkerFromClientXy(x, y, s.drawer);
            uiState.onMarkerClick(marker);
        }

        // if (!this.props.onBoothClick) return;
        const b = getBoothIdFromClientXy(x, y, s.drawer);
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
        const ratio = (svgRect.w * svgRect.h) / (svgArea.h * svgArea.w);
        const minPaddingPercent = ratio > 0.1 ? 5 : 25;

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
        let zoom = 0.3 * Math.min(targetRect.w / bSvgRect.w, targetRect.h / bSvgRect.h);
        const zoom1 = Math.min(targetRect.w / bSvgRect.w, targetRect.h / bSvgRect.h, maxZoom);
        zoom = Math.max(zoom, zoom1);

        const diffX = targetRect.cx - bSvgRect.cx * zoom;
        const diffY = targetRect.cy - bSvgRect.cy * zoom;

        const t = zoomIdentity.translate(diffX, diffY).scale(zoom); // { x: diffX, y: diffY, k: zoom };
        return zoomBound(s.drawer, t, true);
    }
}
