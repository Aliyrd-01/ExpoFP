<template>
    <canvas class="map" @mousemove="handleMouseMove" @click="handleClick" @mouseover="handleMouseOver" @mouseout="handleMouseOut">
        I'm map
    </canvas>
</template>

<script lang="ts">
import { mapGetters, mapState } from "vuex";
import { initialize, requireRedraw, applyZoomTransform, getBoothIdFromClientXy, setVisibleRect } from "./draw";
//import { ZoomBehavior } from "d3";
import { remsToPixels } from "./utils";

export default {
    name: "Map",
    data: () => ({}),
    computed: {
        ...mapState(["overlaySize", "moveToExhibitor", "hoveredBooth", "screenSize", "bookmarked"]),
        ...mapGetters([
            "overlayPosition",
            "exhibitorsArray",
            "boothsArray",
            "selectedExhibitor",
            "selectedBooth",
            "highlightedBoothIdsObj",
            "hoveredBooths"
        ]),
        occupied() {
            let occupied = null;
            if (this.overlayPosition === "left" || (this.overlayPosition === "bottomLeft" && this.overlaySize !== "small")) {
                occupied = "left";
            } else if (this.overlayPosition === "bottom") {
                switch (this.overlaySize) {
                    case "small":
                        occupied = "bottomSmall";
                        break;
                    default:
                        occupied = "bottomMedium";
                        break;
                }
            } else if (this.overlayPosition === "bottomLeft") {
                switch (this.overlaySize) {
                    case "small":
                        occupied = "bottomSmall";
                        break;
                    default:
                        occupied = "left";
                        break;
                }
            }
            return occupied;
        },
        visibleRect() {
            // console.log("get visibleRect", this.occupied);
            const w = this.screenSize.width;
            const h = this.screenSize.height;
            // let w1 = this.$el.parentElement.clientWidth;
            // let h1 = this.$el.parentElement.clientHeight;
            // debugger;
            // w = w1;
            // h = h1;

            switch (this.occupied) {
                case "left":
                    return Rect.fromX1y1x2y2(remsToPixels(21), 0, w, h);
                case "bottomSmall":
                    return Rect.fromX1y1x2y2(0, 0, w, h - remsToPixels(4));
                case "bottomMedium":
                    return Rect.fromX1y1x2y2(0, 0, w, h - remsToPixels(12));
            }

            throw new Error("Not supported `occupied`");
        }
    },
    mounted() {
        const canvas = this.$el;
        // const $parent = d3.select(canvas.parentElement);
        this.$canvas = d3.select(canvas);
        this.zoom = d3
            .zoom()
            .clickDistance(15)
            .scaleExtent([0.8, 8])
            .on("zoom", () => applyZoomTransform(d3.event.transform));
        this.$canvas.call(this.zoom);

        initialize(canvas, this.visibleRect);
    },
    watch: {
        moveToExhibitor: function() {
            if (this.handledMoveToExhibitor === this.moveToExhibitor || !this.moveToExhibitor) return;
            this.handledMoveToExhibitor = this.moveToExhibitor;
            console.log("watched moveToExhibitor", this.moveToExhibitor);
            // ask map to move to this exhibitor
            const rects = this.boothsArray.filter(b => b.exhibitors.indexOf(this.moveToExhibitor) !== -1).map(b => b.rect);
            if (rects.length === 0) return;
            var r = Rect.fromX1y1x2y2(
                Math.min(...rects.map(x => x.x1)),
                Math.min(...rects.map(x => x.y1)),
                Math.max(...rects.map(x => x.x2)),
                Math.max(...rects.map(x => x.y2))
            );
            //const z = getZoomToFitSvgRect(r);
            const destZoom = d3.zoomIdentity; //.translate(z.x, z.y).scale(z.k);
            this.$canvas
                .transition()
                .duration(200)
                .call(this.zoom.transform, destZoom);
        },
        hoveredBooths: () => requireRedraw(),
        selectedExhibitor: () => requireRedraw(),
        selectedBooth: () => requireRedraw(),
        bookmarked: () => requireRedraw(),
        highlightedBoothIdsObj: () => requireRedraw(),
        visibleRect: v => setVisibleRect(v)
    },
    methods: {
        raiseBoothOver(id) {
            id = id || null;
            if (this.prevBoothOver === id) return;
            this.prevBoothOver = id;
            this.$store.commit("setHoveredBooth", id);
            //this.props.onBoothOver(id || null);
        },
        handleMouseMove(e) {
            const id = getBoothIdFromClientXy(e.clientX, e.clientY);
            // //console.log('Mouse Move', e.clientX, e.clientY, id, e);
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
            //if (!this.props.onBoothClick) return;
            const id = getBoothIdFromClientXy(e.clientX, e.clientY);
            console.info("click", id);
            this.$store.dispatch("clickBooth", id);
        }
    }
};
</script>

<style scoped>
</style>
