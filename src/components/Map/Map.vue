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
// import { initialize, requireRedraw, applyZoomTransform, setVisibleRect } from "./draw";
import { initialize, applyZoomTransform, applyVisibleRect } from "./draw";
//import { ZoomBehavior } from "d3";
import { remsToPixels } from "./utils";
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
        const d3canv = this.$canvas = d3.select(canvas);

        let transforms = [];
        let currentInertialAf;
        const transitionDuration = 1000;
        let initialTransitionSpeedX = 0.4; // per ms
        let initialTransitionSpeedY = 0.4; // per ms

        const zoom = this.zoom = d3
            .zoom()
            .clickDistance(15)
            .scaleExtent([0.5, 12])
            .on("zoom", () => applyZoomTransform(d3.event.transform))
            .on("zoom.inertial start end", () => {
                var e = d3.event;
                console.log(
                    "zoom start end",
                    e,
                    e.type,
                    e.sourceEvent,
                    e.transform
                );

                if (e.sourceEvent) {
                    this.$canvas.interrupt();
                }

                if (e.type === "start" && e.sourceEvent) {
                    window.cancelAnimationFrame(currentInertialAf);
                    transforms = [];
                    transforms.push({
                        at: performance.now(),
                        transform: e.transform
                    });
                    // lastTransform = e.transform;
                    // lastTransformTime = performance.now();
                }

                if (e.type === "zoom" && e.sourceEvent) {
                    transforms.push({
                        at: performance.now(),
                        transform: e.transform
                    });
                    // remove all having
                }

                if (e.type === "end" && e.sourceEvent) {
                    const min = 50;
                    const now = performance.now();
                    const maxAt = now - min;
                    for (var i = transforms.length - 1; i >= 0; i--) {
                        var t = transforms[i];
                        if (t.at < maxAt || i == 0) {
                            // take it
                            var time = now - t.at;
                            var diffX =
                                (e.transform.x - t.transform.x) / e.transform.k;
                            var diffY =
                                (e.transform.y - t.transform.y) / e.transform.k;
                            initialTransitionSpeedX = diffX / time;
                            initialTransitionSpeedY = diffY / time;
                            break;
                        }
                    }

                    console.log(
                        "spped",
                        initialTransitionSpeedX,
                        initialTransitionSpeedY
                    );
                    //if (enableInertia)
                    doTransition();
                    //root.transition().duration(1000).call(zoom.translateBy, 300,300)
                    //window.setTimeout(function(){root.interrupt()}, 200)
                }
            });

        function doTransition() {
            console.log("Started transitino");

            //var totalDistance = (initialSpeed * initialSpeed ) * declineK;

            var start = performance.now();
            var till = start + transitionDuration;
            var prevSpeedX = initialTransitionSpeedX;
            var prevSpeedY = initialTransitionSpeedY;
            var prevTime = start;

            function doStep() {
                var now = performance.now();
                var part = (till - now) / transitionDuration;
                if (part < 0) part = 0;
                var partEasy = d3.easePolyIn.exponent(3)(part);
                var currentSpeedX = initialTransitionSpeedX * partEasy;
                var currentSpeedY = initialTransitionSpeedY * partEasy;
                var avgSpeedX = (currentSpeedX + prevSpeedX) / 2;
                var avgSpeedY = (currentSpeedY + prevSpeedY) / 2;
                var durationSincePrev = now - prevTime;
                prevSpeedX = currentSpeedX;
                prevSpeedY = currentSpeedY;
                prevTime = now;
                const distanceSincePrevX = durationSincePrev * avgSpeedX;
                const distanceSincePrevY = durationSincePrev * avgSpeedY;
                //console.log("doStep", partEasy);

                d3canv.call(
                    zoom.translateBy,
                    distanceSincePrevX,
                    distanceSincePrevY
                );

                // root.call(zoom.translateBy, transitionSpeed, transitionSpeed);
                if (partEasy > 0.02) {
                    currentInertialAf = window.requestAnimationFrame(doStep);
                }
            }
            currentInertialAf = window.requestAnimationFrame(doStep);
        }

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
        // hoveredBoothIds: () => requireRedraw(),
        // selectedBoothIds: () => requireRedraw(),
        // bookmarked: () => requireRedraw(),
        // listBoothsIds: () => requireRedraw(),
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
