<template>
    <canvas class="map" @mousemove="handleMouseMove" @click="handleClick" @mouseover="handleMouseOver" @mouseout="handleMouseOut">
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
import zoomBound from "./zoom-bound";

export default {
    name: "Map",
    data: () => ({}),
    computed: {
        ...mapState([
            "overlaySize",
            "moveToBooths",
            "centerMap",
            "booths",
            "hoveredBooth",
            "screenSize",
            "bookmarked"
        ]),
        ...mapGetters([
            "overlayPosition",
            "exhibitorsArray",
            "listBoothsIds",
            "selectedBoothIds",
            "hoveredBoothIds"
        ]),
        visibleRect() {
            // console.log("get visibleRect", this.occupied);
            const w = this.screenSize.width;
            const h = this.screenSize.height;

            switch (this.overlayPosition) {
                case "left":
                    return Rect.fromX1y1x2y2(remsToPixels(21), 0, w, h);
                // case "bottomSmall":
                //     return Rect.fromX1y1x2y2(0, 0, w, h - remsToPixels(4));
                case "bottom":
                    return Rect.fromX1y1x2y2(0, 0, w, h - remsToPixels(12));
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
            .on("zoom", () => {
                const t = currentEvent.transform;
                const nt = zoomBound(t);
                if (nt) {
                    this.zoomTo(nt, false);
                    //  console.log('fixed bounds 2', t, nt)
                } else m.setZoomTransform(t);
            });
        configInertia(this.zoom);
        m.setVisibleRect(this.visibleRect);
        m.setZoomTransform(d3.zoomIdentity);
        this.$canvas.call(this.zoom);
        initialize(canvas);
    },
    watch: {
        centerMap: function () {
            if (!this.centerMap) return;
            store.commit("setCenterMap", false);
            this.zoomTo({ x: 0, y: 0, k: 1 }, true);
        },
        moveToBooths: function () {
            console.log("this.moveToBooths", this.moveToBooths);
            if (!this.moveToBooths) return;
            this.handledMoveToExhibitor = this.moveToBooths;
            console.log("watched moveToBooths", this.moveToBooths);
            // // ask map to move to this exhibitor
            const rects = this.moveToBooths.map(
                id => this.booths[id].rect
            ) as Rect[];
            if (rects.length === 0) return;
            const r = Rect.fromMultiple(rects);
            const zoomScale = m.getZoomTransform().k;
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
            console.log("visibleRect change", v);
            m.setVisibleRect(v);
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
            console.log("click", id);
            this.$store.dispatch("clickBooth", id);
        },
        zoomTo(transform: ZoomTransform, animated: boolean) {
            const t = m.getZoomTransform();
            if (t.x === transform.x && t.y === transform.y && t.k === transform.k) return;

            let c = this.$canvas.interrupt();
            if (animated)
                c = c
                    .transition()
                    .ease(d3.easeExpOut)
                    .duration(500);
            const z = d3.zoomIdentity
                .translate(transform.x, transform.y)
                .scale(transform.k);
            c.call(this.zoom.transform, z);
        },
        zoomBoundCurrent() {
            const ct = m.getZoomTransform();
            const nt = zoomBound(ct);
            if (nt) {
                // console.log('fixed bounds', ct, nt)
                this.zoomTo(nt, false);
            }
        }
    }
};

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

    const [x1, y1] = m4.transformPoint(svgPxMatrix, [
        svgRect.x1,
        svgRect.y1,
        1
    ]);
    const [x2, y2] = m4.transformPoint(svgPxMatrix, [
        svgRect.x2,
        svgRect.y2,
        1
    ]);
    const bSvgRect = Rect.fromX1y1x2y2(x1, y1, x2, y2);

    // console.log(bSvgRect.w, bSvgRect.h, bSvgRect);

    // get max zoom
    const zoom = Math.min(
        targetRect.w / bSvgRect.w,
        targetRect.h / bSvgRect.h,
        maxZoom
    );

    const diffX = targetRect.cx - bSvgRect.cx * zoom;
    const diffY = targetRect.cy - bSvgRect.cy * zoom;

    return { x: diffX, y: diffY, k: zoom };
}
</script>

<style scoped>
</style>
