<template>
    <div :class='overlaySize + " overlay"'>
        <OverlayContent/>
    </div>
</template>

<script lang="ts">
import { mapGetters, mapState } from "vuex";
import OverlayContent from "./OverlayContent.vue";

export default {
    name: "Overlay",

    components: {
        OverlayContent
    },

    computed: {
        ...mapState(["overlaySize", "screenSize"]),
        ...mapGetters(["overlayPosition"]),
        negateMove() {
            return this.overlayPosition === "left";
        },
        effectiveSize() {
            if (this.overlayPosition === "bottomLeft" && this.overlaySize === "medium") return "full";
            return this.overlaySize;
        }
    },

    mounted: function() {
        this.$el.ontouchstart = this.handleTouchStart;
        this.$el.ontouchmove = this.handleTouchMove;
        this.$el.ontouchend = this.handleTouchEnd;
        this.$el.ontouchcancel = this.handleTouchCancel;
        this.position();
        ["screenSize", "overlaySize", "overlayPosition"].forEach(p => this.$watch(p, this.position));
    },

    methods: {
        handleTouchStart(e) {
            console.log("TouchStart", e);
            if (this.startedTouch) return;

            const scrollable = e.target.closest(".overlay-scrollable");
            if (scrollable && scrollable.scrollTop > 0) return;
            this.startedTouch = e.touches[0];
        },

        handleTouchMove(e:TouchEvent) {
            if (!this.startedTouch) return;
            const rt = Array.from(e.changedTouches).filter(x => x.identifier === this.startedTouch.identifier)[0];
            if (!rt) return;
            this.touchDiff = this.startedTouch.clientY - rt.clientY;
            console.log("TouchMove", this.touchDiff);
            this.setHeight();
        },

        handleTouchEnd(e:TouchEvent) {
            if (!this.startedTouch) return;
            const rt = Array.from(e.changedTouches).filter(x => x.identifier === this.startedTouch.identifier)[0];
            if (!rt) return;
            let diff = this.startedTouch.clientY - rt.clientY;
            if (this.negateMove) diff = -diff;
            const current = getHeight(this.$el, this.overlayPosition, this.effectiveSize);
            const medium = getHeight(this.$el, this.overlayPosition, "medium");
            let newSize = this.effectiveSize;
            if (diff < 0) {
                if (this.effectiveSize === "medium" || current + diff < medium) newSize = "small";
                else if (this.effectiveSize === "full") {
                    if (this.overlayPosition === "bottomLeft") newSize = "small";
                    else newSize = "medium";
                }
            } else if (diff > 0) {
                if (this.effectiveSize === "medium" || current + diff > medium) newSize = "full";
                else if (this.effectiveSize === "small") {
                    if (this.overlayPosition === "bottomLeft") newSize = "full";
                    else newSize = "medium";
                }
            }
            console.log("TouchEnd", newSize);
            const touchDiff = this.touchDiff;
            this.startedTouch = undefined;
            this.touchDiff = undefined;
            if (Math.abs(touchDiff) > 10 && newSize !== this.overlaySize) {
                this.$store.commit("setOverlaySize", newSize);
            }
            //this.defaultSize = newSize
            // this will now transition to desired size
            this.position();
        },

        handleTouchCancel() {
            this.startedTouch = undefined;
        },

        position() {
            const el = this.$el;
            const position = this.overlayPosition;
            el.style.width = position === "bottom" ? "100%" : "22rem";
            el.style.left = position === "bottom" ? "0" : rtp(paddingRems) + "px";
            if (position === "left") {
                el.style.bottom = undefined;
                el.style.top = rtp(paddingRems) + "px";
                el.style.borderBottomLeftRadius = el.style.borderBottomRightRadius = null;
            } else {
                el.style.bottom = "0";
                el.style.borderBottomLeftRadius = el.style.borderBottomRightRadius = "0";
                el.style.top = undefined;
            }

            this.setHeight();
        },

        setHeight() {
            // height depends on size and ongoing touch
            // let's animate when no touch in progress
            const position = this.overlayPosition;
            let newHeight = getHeight(this.$el, position, this.effectiveSize);

            let transition = true;
            if (this.touchDiff !== undefined) {
                newHeight += this.negateMove ? -this.touchDiff : this.touchDiff;
                const maxHeight = getHeight(this.$el, position, "full");
                if (newHeight > maxHeight) {
                    newHeight = maxHeight;
                }
                transition = false;
            } else if (this.currentHeight == undefined) {
                transition = false;
            }
            if (this.currentHeight === newHeight) return;
            const $el = d3.select(this.$el);
            $el.interrupt();
            if (transition) {
                $el
                    .transition()
                    .ease(d3.easePolyOut)
                    .duration(500)
                    .style("height", newHeight + "px");
            } else {
                this.$el.style.height = newHeight + "px";
            }

            if (this.currentHeight != newHeight && window.event) window.event.preventDefault();
            this.currentHeight = newHeight;
        }
    }
};

const miniSizeRems = 3.5;
const mediumSizeRems = 10;
const paddingRems = 2;

function rtp(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

function getHeight(el, position, size) {
    const containerHeight = el.parentElement.getBoundingClientRect().height;
    switch (position) {
        case "left":
            switch (size) {
                case "full":
                    return containerHeight - rtp(paddingRems * 2);
                case "medium":
                    return rtp(mediumSizeRems);
                case "small":
                    return rtp(miniSizeRems);
            }
            break;
        case "bottom":
            switch (size) {
                case "full":
                    return containerHeight - rtp(paddingRems);
                case "medium":
                    return rtp(mediumSizeRems);
                case "small":
                    return rtp(miniSizeRems);
            }
            break;
        case "bottomLeft": {
            switch (size) {
                case "medium":
                case "full":
                    return containerHeight - rtp(paddingRems);
                // case "medium": return rtp(mediumSizeRems);
                case "small":
                    return rtp(miniSizeRems);
            }
            break;
        }
    }
    return null;
}
</script>

<style scoped>
.overlay {
    position: absolute;
    background: #fff; /*#f9f4f0*/
    border-radius: 0.7rem;
    overflow: hidden;
    box-shadow: 0 0 25px rgba(0, 0, 0, 0.1);
    --iconWidth: 3rem;
}
</style>
