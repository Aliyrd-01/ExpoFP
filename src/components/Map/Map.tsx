import classNames from "classnames";
// TODO: RESTORE - only use what's needed from d3
import * as d3 from "d3";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Map.scss";
import configInertia from "./zoom-inertia";
import { m4 } from "twgl.js";
import { event as currentEvent } from "d3-selection";
// import { overlayWidthRems, overlayMediumHeightRems } from '../sizes';
import zoomBound from "./zoom-bound";
import { ZoomTransform } from "d3";
import Rect from "../../core/Rect";
import createDrawer, { Drawer } from "./drawing/drawer";
import logger from "../../tools/logger";
import { sizeCanvasToParentElement } from "./utils";

export default function Map() {
    const el = useRef<HTMLCanvasElement>();
    const [$canvas, set$canvas] = useState<d3.Selection<HTMLCanvasElement, unknown, null, undefined>>();
    const [zoom, setZoom] = useState<d3.ZoomBehavior<Element, unknown>>();
    const [drawer, setDrawer] = useState<Drawer>();

    const s = useLocalStore(() => ({
        animatePlease: false,
        moving: false,
        // $canvas : null as d3.Selection<HTMLCanvasElement, unknown, null, undefined>,
        // zoom: null as d3.ZoomBehavior<Element, unknown>,
        // drawer: null as Drawer
    }));

    // init
    useEffect(() => {
        const $canvas = d3.select(el.current);
        set$canvas($canvas);
        //s.$canvas = d3.select(el.current);
        const zoom = d3
            .zoom()
            .clickDistance(15)
            .interpolate(d3.interpolate)
            .scaleExtent([0.5, 12])
            .constrain((transform, extent, translateExtent) => zoomBound(drawer, transform, false))
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

            setZoom(zoom);

            configInertia(s.zoom);
            //m.setVisibleRect(this.visibleRect);
            sizeCanvasToParentElement(el.current);
            const drawer = createDrawer(el.current, true);
            setDrawer(drawer);
            drawer.setVisibleRect((this.visibleRect as Rect).scale(this.devicePixelRatio));
            drawer.setPixelRatio(this.devicePixelRatio);
    
            window.addEventListener("resize", () => {
                // __logger.log('canvas change', canvas);
                sizeCanvasToParentElement(canvas);
                drawer.resetCanvasSize();
            });
    
            setZoomTransformAnimated(d3.zoomIdentity, 0, null);
            this.$canvas.call(this.zoom);
    
            //if (EFP_EXPO === "cbresupplypartner") store.commit("setArea", "ground");
    }, [el.current]);

    return useObserver(() => (
        <canvas
            ref={el}
            className={classNames({ map: true, moving: s.moving })}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
        >
            ExpoFP.com
        </canvas>
    ));




    let zoomAf: number;
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
