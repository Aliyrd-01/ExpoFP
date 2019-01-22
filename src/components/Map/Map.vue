<template>
    <canvas
        class="map"
        @mousemove="handleMouseMove"
        @click="handleClick"
        @mouseover="handleMouseOver"
        @mouseout="handleMouseOut"
    >
        I'm map
    </canvas>
</template>

<script lang="ts">
import { mapGetters, mapState } from "vuex";
import getBoothIdFromClientXy from "./booth-by-xy";
import { svgWidth, svgHeight } from "@/tools/svg";
// import { initialize, requireRedraw, applyZoomTransform, setVisibleRect } from "./draw";
import { initialize, applyZoomTransform, applyVisibleRect } from "./draw";
import { getCurrentMatrixAndScale } from "./config-matrix";
//import { ZoomBehavior } from "d3";
import { remsToPixels } from "./utils";
import configInertia from "./zoom-inertia";
// import { setZoomAndDimensions } from './matrix-scale';
// import c from "./drawing-context";

export default {
    name: "Map",
    data: () => ({}),
    computed: {
        ...mapState([
            "overlaySize",
            "moveToBooths",
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
        const canvas = this.$el;
        // const $parent = d3.select(canvas.parentElement);
        const d3canv = (this.$canvas = d3.select(canvas));

        let transforms = [];
        let currentInertialAf;
        const transitionDuration = 1000;
        let initialTransitionSpeedX = 0.4; // per ms
        let initialTransitionSpeedY = 0.4; // per ms

        const zoom = (this.zoom = d3
            .zoom()
            .clickDistance(15)
            .scaleExtent([0.5, 12])
            .on("zoom", () => {
                // console.error('zoom bounds are buggy!!!')
                // inspired by: http://bl.ocks.org/shawnbot/6518285
                const { pxSvgScale } = getCurrentMatrixAndScale();
                const transform = d3.event.transform;
                //const svgToPxScale = 1 / ptscale / transform.k / devicePixelRatio;

                const svgPyUnscaled =
                    (svgHeight * pxSvgScale) / devicePixelRatio;
                const svgPxUnscaled =
                    (svgWidth * pxSvgScale) / devicePixelRatio;
                const vRect = this.visibleRect as Rect;
                //const svgPx = svgWidth * svgToPxScale;
                const allow = 0.8;
                const maxTy = (vRect.h * allow + svgPyUnscaled) / 2;
                const minTy = -maxTy * transform.k;
                const maxTx = (vRect.w * allow + svgPxUnscaled) / 2;
                const minTx = -maxTx * transform.k;
                //max/min are not symmetric
                //
                // const maxTy = (vRect.h * allow + svgPy) / 2;
                // const minTy = -maxTy * transform.k;
                // const maxTx = (vRect.w * allow + svgPx) / 2;
                // const minTx = -maxTx * transform.k;

                console.log(svgPyUnscaled, transform.y, transform.k);
                transform.y = Math.min(maxTy, Math.max(minTy, transform.y));
                transform.x = Math.min(maxTx, Math.max(minTx, transform.x));

                applyZoomTransform(d3.event.transform);
            }));
        configInertia(zoom);
        this.$canvas.call(this.zoom);
        initialize(canvas, this.visibleRect);
    },
    watch: {
        moveToBooths: function() {
            if (!this.moveToBooths) return;
            // this.handledMoveToExhibitor = this.moveToBooths;
            // console.log("watched moveToBooths", this.moveToBooths);
            // // ask map to move to this exhibitor
            // const rects = this.moveToBooths.map(id => this.booths[id].rect) as Rect[];
            // if (rects.length === 0) return;
            // var r = Rect.fromMultiple(rects);
            // // const z = getZoomToCenterSvgRect(r, Math.max(c.zoomScale, 1.2));
            // const destZoom = d3.zoomIdentity.translate(z.x, z.y).scale(z.k);
            // this.$canvas
            //     .transition()
            //     .duration(200)
            //     .call(this.zoom.transform, destZoom);

            // store.commit("setMoveToBooths", null);
            // this.handledMoveToExhibitor = null;
        },
        visibleRect: v => applyVisibleRect(v)
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
            console.info("click", id);
            this.$store.dispatch("clickBooth", id);
        }
    }
};

// function getZoomToCenterSvgRect(svgRect: Rect, zoom: number) {
//     const { cx, cy } = svgRect;

//     const browserCx = c.visibleBRect.cx;
//     const browserCy = c.visibleBRect.cy;

//     const svgBcx = svgRect.cx * c.fpScale + c.fpCxUnzoomed;
//     const svgBcy = svgRect.cy * c.fpScale + c.fpCyUnzoomed;

//     const diffX = browserCx - svgBcx * zoom;
//     const diffY = browserCy - svgBcy * zoom;

//     return { x: diffX, y: diffY, k: zoom };
// }

// function getZoomToCenterSvgRect(svgRect: Rect, maxZoom: number) {
//     const minPaddingPercent = 5;

//     const targetRect = c.visibleBRect.withPadding(
//         (c.visibleBRect.w * minPaddingPercent) / 100,
//         (c.visibleBRect.h * minPaddingPercent) / 100
//     );

//     const bSvgRect = c.sRectToBrowserUnzoomed(svgRect);

//     // get max zoom
//     const zoom = Math.min(targetRect.w / bSvgRect.w, targetRect.h / bSvgRect.h, maxZoom);

//     const diffX = targetRect.cx - bSvgRect.cx * zoom;
//     const diffY = targetRect.cy - bSvgRect.cy * zoom;

//     return { x: diffX, y: diffY, k: zoom };
// }
</script>

<style scoped>
</style>
