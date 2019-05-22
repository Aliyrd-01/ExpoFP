<template>
    <canvas class="map" @mousemove="handleMouseMove" @click="handleClick" @mouseover="handleMouseOver" @mouseout="handleMouseOut"
        :class='{moving}'>
        ExpoFP.com
    </canvas>
</template>

<script lang="ts">
import { mapGetters, mapState } from "vuex";
import getBoothIdFromClientXy from "./booth-by-xy";
import { svgWidth, svgHeight } from "@/tools/svg";
import { initialize } from "./draw";
import * as m from "./matrix";
import { remsToPixels } from "./utils";
import configInertia from "./zoom-inertia";
import { m4 } from "twgl.js";
import { event as currentEvent } from "d3-selection";
// import { overlayWidthRems, overlayMediumHeightRems } from '../sizes';
import zoomBound from "./zoom-bound";

export default {
    name: "Map",
    data: () => ({ moving: false }),
    computed: {
        ...mapState([
            "overlaySize",
            "moveToBooths",
            "centerMap",
            "zoomBy",
            "area",
            "booths",
            "hoveredBooth",
            "screenSize",
            "bookmarked",
            "overlayWidthRems",
            "overlayMediumHeightRems"
        ]),
        ...mapGetters([
            "overlayPosition",
            "exhibitorsArray",
            "listBoothsIds",
            "selectedBoothIds",
            "hoveredBoothIds",
            "wsFullHeightPx"
        ]),
        visibleRect() {
            // __logger.log("get visibleRect", this.occupied);
            const w = this.screenSize.width;
            const h = this.screenSize.height;

            let rect: Rect;

            switch (this.overlayPosition) {
                case "left":
                    // rect = Rect.fromX1y1x2y2(remsToPixels(this.overlayWidthRems), this.wsFullHeightPx, w, h);
                    // if (EFP_EXPO === 'cbresupplypartner') 
                    rect = Rect.fromX1y1x2y2(remsToPixels(this.overlayWidthRems), 0, w, h - this.wsFullHeightPx);
                    break;
                // case "bottomSmall":
                //     return Rect.fromX1y1x2y2(0, 0, w, h - remsToPixels(4));
                case "bottom":
                    rect = Rect.fromX1y1x2y2(0, this.wsFullHeightPx, w, h - remsToPixels(this.overlayMediumHeightRems));
                    break;
            }

            if (rect) {
                rect = rect.withPadding(rect.w * 0.05, rect.h * 0.05);
                return rect;
            }
            throw new Error("Not supported `overlayPosition`");
        }
    },
    mounted() {
        const canvas = this.$el as HTMLCanvasElement;
        this.$canvas = d3.select(canvas);

        this.zoom = d3
            .zoom()
            .clickDistance(15)
            .interpolate(d3.interpolate)
            .scaleExtent([0.5, 12])
            .constrain((transform, extent, translateExtent) => zoomBound(transform, false))
            .on("zoom", () => {
                const t = currentEvent.transform;
                const isWheel = currentEvent.sourceEvent && currentEvent.sourceEvent.type === "wheel";
                __logger.log('zoom', currentEvent, currentEvent.sourceEvent && currentEvent.sourceEvent.type);
                if (isWheel || this.animatePlease)
                    setZoomTransformAnimated(t, 300, d3.easeExpOut);
                else if (t.animate)
                    setZoomTransformAnimated(t, 500, d3.easeExpOut);
                else
                    setZoomTransformAnimated(t, 0, null);

                this.animatePlease = false;
                this.moving = true;
            })
            .on("end", () => {
                this.moving = false;
            });
        ;
        configInertia(this.zoom);
        m.setVisibleRect(this.visibleRect);
        setZoomTransformAnimated(d3.zoomIdentity, 0, null);
        this.$canvas.call(this.zoom);
        initialize(canvas);


        window.addEventListener("beforeprint", () => {
            let rect = Rect.fromXywh(0, 0, this.screenSize.width, this.screenSize.height);
            rect = rect.withPadding(rect.w * 0.05, rect.h * 0.05);
            m.setVisibleRect(rect);
            //m.setZoomTransform(d3.zoomIdentity);
            this.$canvas.call(this.zoom.transform, d3.zoomIdentity);
        });

        store.commit("setArea", "ground");
    },
    watch: {
        centerMap: function () {
            if (!this.centerMap) return;
            store.commit("setCenterMap", false);
            this.zoomTo(d3.zoomIdentity, true);
        },
        zoomBy: function () {
            if (!this.zoomBy) return;
            const z = this.zoomBy;
            store.commit("setZoomBy", null);
            //const t = d3.zoomTransform(this.$canvas.node());
            this.animatePlease = true;
            this.$canvas.call(this.zoom.scaleBy, z === -1 ? 0.66 : 1.5);

            // const t = d3.zoomTransform(this.$canvas.node());
            // d3.sca
            // t = t.scaleBy(1)
            // this.zoomTo(t, true);
        },
        area: function () {
            if (!this.area) return;
            const a = this.area;
            store.commit("setArea", null);
            let x: number;
            if (a === "ground") {
                x = 559;
            } else if (a === "mezzanine") {
                x = 1964;
            } else if (a === "first") {
                x = 3400;
            }
            if (x) {
                const r = Rect.fromCxcywh(x, 621, 1111 * 0.85, 1238 * 0.85);
                const z = getTramsformToCenterSvgRect(
                    r,
                    this.visibleRect,
                    4
                );
                this.zoomTo(z, true);
            }
        },
        moveToBooths: function () {
            __logger.log("this.moveToBooths", this.moveToBooths);
            if (!this.moveToBooths) return;
            this.handledMoveToExhibitor = this.moveToBooths;
            __logger.log("watched moveToBooths", this.moveToBooths);
            // // ask map to move to this exhibitor
            const rects = this.moveToBooths.map(
                id => this.booths[id].rect
            ) as Rect[];
            if (rects.length === 0) return;
            const r = Rect.fromMultiple(rects);
            const zoomScale = d3.zoomTransform(this.$canvas.node()).k;//m.getZoomTransform().k;
            const z = getTramsformToCenterSvgRect(
                r,
                this.visibleRect,
                Math.max(zoomScale, 1.2)
            );
            this.zoomTo(z, true);

            store.commit("setMoveToBooths", null);
            this.handledMoveToExhibitor = null;
        },
        visibleRect: function (v) {
            __logger.log("visibleRect change", v);
            m.setVisibleRect(v);
            // rezoom to make it fit bounds
            // this.$canvas.call(this.zoom.transform, d3.zoomTransform(this.$canvas.node()));
            this.zoomBoundCurrent();
        }
    },
    methods: {
        raiseBoothOver(id) {
            id = id || null;
            if (this.prevBoothOver === id) return;
            this.prevBoothOver = id;
            this.$store.commit("setHoveredBooth", id);
        },
        handleMouseMove(e) {
            const id = getBoothIdFromClientXy(e.clientX, e.clientY);
            this.raiseBoothOver(id);
        },
        handleMouseOver(e) {
            const id = getBoothIdFromClientXy(e.clientX, e.clientY);
            this.raiseBoothOver(id);
        },
        handleMouseOut(e) {
            this.raiseBoothOver(undefined);
        },
        handleClick(e) {
            if (
                this.overlayPosition === "bottom" &&
                this.overlaySize === "full"
            ) {
                this.$store.dispatch("showMap");
            }
            // if (!this.props.onBoothClick) return;
            const id = getBoothIdFromClientXy(e.clientX, e.clientY);
            __logger.log("click", id);
            this.$store.dispatch("clickBooth", id);
        },
        zoomTo(transform: ZoomTransform) {
            const t = d3.zoomTransform(this.$canvas.node());
            if (t.x === transform.x && t.y === transform.y && t.k === transform.k) return;
            (transform as any).animate = true;
            this.$canvas.call(this.zoom.transform, transform);
        },
        zoomBoundCurrent() {
            const ct = d3.zoomTransform(this.$canvas.node());
            const nt = zoomBound(ct, false);
            if (nt !== ct) {
                // __logger.log('fixed bounds', ct, nt)
                this.zoomTo(nt);
            }
        }
    }
};

let zoomAf: number;
function setZoomTransformAnimated(t: ZoomTransform, duration: number, easingFunc: (k: number) => number) {
    // animate from existing position to dest
    if (zoomAf) cancelAnimationFrame(zoomAf);
    if (!duration) {
        m.setZoomTransform(t);
        return;
    }
    const ct = m.getZoomTransform();
    const i = d3.interpolate(ct, t);
    const start = performance.now();

    function animationStep() {
        const part = Math.min(1, (performance.now() - start) / duration);
        const easedPart = easingFunc ? easingFunc(part) : part;
        const val = i(easedPart);
        m.setZoomTransform(val);
        if (part !== 1) {
            zoomAf = requestAnimationFrame(animationStep);
        } else {
            __logger.log("setZoomTransformAnimated ended", part)
        }
    }
    animationStep();
}

function getTramsformToCenterSvgRect(
    svgRect: Rect,
    vRect: Rect,
    maxZoom: number
) {
    const minPaddingPercent = 5;

    const targetRect = vRect.withPadding(
        (vRect.w * minPaddingPercent) / 100,
        (vRect.h * minPaddingPercent) / 100
    );

    const svgPxMatrix = m.getSvgPxUnzoomedMatrix();

    const xy1 = m4.transformPoint(svgPxMatrix, [
        svgRect.x1,
        svgRect.y1,
        1
    ], null);
    const x1 = xy1[0], y1 = xy1[1];
    const xy2 = m4.transformPoint(svgPxMatrix, [
        svgRect.x2,
        svgRect.y2,
        1
    ], null);
    const x2 = xy2[0], y2 = xy2[1];
    const bSvgRect = Rect.fromX1y1x2y2(x1, y1, x2, y2);

    // __logger.log(bSvgRect.w, bSvgRect.h, bSvgRect);

    // get max zoom
    const zoom = Math.min(
        targetRect.w / bSvgRect.w,
        targetRect.h / bSvgRect.h,
        maxZoom
    );

    const diffX = targetRect.cx - bSvgRect.cx * zoom;
    const diffY = targetRect.cy - bSvgRect.cy * zoom;
    const t = d3.zoomIdentity.translate(diffX, diffY).scale(zoom);// { x: diffX, y: diffY, k: zoom };
    return zoomBound(t, true);
}
</script>

<style>
@media print {
    canvas {
        width: auto !important;
        height: auto !important;
        max-width: 100%;
        max-height: 100%;
    }
}
canvas.moving {
    cursor: move;
}
</style>
