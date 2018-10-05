<template>
    <div :class='overlaySize' class="overlay">
        <Menu />
        <Search />
        <Bookmarks />
        <Category />
        <Exhibitor />
        <Booth />
    </div>
</template>

<script lang="ts">
import { mapGetters, mapState } from "vuex";
import Menu from "./Menu.vue";
import Search from "./Search.vue";
import Bookmarks from "./Bookmarks.vue";
import Category from "./Category.vue";
import Exhibitor from "./Exhibitor.vue";
import Booth from "./Booth.vue";

export default {
    components: { Menu, Search, Bookmarks, Category, Exhibitor, Booth },
    computed: {
        ...mapState(["overlaySize", "screenSize"]),
        ...mapGetters(["overlayPosition"]),
        noMove() {
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
            if (this.noMove) return;
            console.log("TouchStart", e);
            if (this.startedTouch) return;

            const scrollable = e.target.closest(".overlay-content__scrollable");
            if (scrollable && scrollable.scrollTop > 0) return;
            this.startedTouch = e.touches[0];
        },

        handleTouchMove(e: TouchEvent) {
            if (this.noMove) return;
            if (!this.startedTouch) return;
            const rt = Array.from(e.changedTouches).filter(x => x.identifier === this.startedTouch.identifier)[0];
            if (!rt) return;
            this.touchDiff = this.startedTouch.clientY - rt.clientY;
            console.log("TouchMove", this.touchDiff);
            this.setHeight();
        },

        handleTouchEnd(e: TouchEvent) {
            if (this.noMove) return;
            if (!this.startedTouch) return;
            const rt = Array.from(e.changedTouches).filter(x => x.identifier === this.startedTouch.identifier)[0];
            if (!rt) return;
            let diff = this.startedTouch.clientY - rt.clientY;
            const overlayPosition = this.overlayPosition as OverlayPosition;
            // if (this.negateMove) diff = -diff;
            const current = getHeight(this.$el, overlayPosition, this.effectiveSize);
            const medium = getHeight(this.$el, overlayPosition, "medium");
            let newSize = this.effectiveSize;
            if (diff < 0) {
                if (this.effectiveSize === "medium" || current + diff < medium) newSize = "small";
                else if (this.effectiveSize === "full") {
                    if (overlayPosition === "bottomLeft") newSize = "small";
                    else newSize = "medium";
                }
            } else if (diff > 0) {
                if (this.effectiveSize === "medium" || current + diff > medium) newSize = "full";
                else if (this.effectiveSize === "small") {
                    if (overlayPosition === "bottomLeft") newSize = "full";
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
            const el = this.$el as HTMLDivElement;
            const position = this.overlayPosition as OverlayPosition;
            let width: string, height: string, left: string, top: string;
            const w = "24rem";
            switch (position) {
                case "left":
                    width = w;
                    top = "0";
                    left = "0";
                    break;
                case "bottom":
                    width = "100%";
                    break;
                case "bottomLeft":
                    width = w;
                    left = "1rem";
                    break;
            }

            el.style.width = width;
            el.style.height = height;
            el.style.left = left;
            el.style.top = top;

            this.setHeight();
        },

        setHeight() {
            // height depends on size and ongoing touch
            // let's animate when no touch in progress
            const position = this.overlayPosition as OverlayPosition;
            if (position === "left") return;

            let newHeight = getHeight(this.$el, position, this.effectiveSize);

            let transition = true;
            if (this.touchDiff !== undefined) {
                newHeight += this.touchDiff; // this.negateMove ? -this.touchDiff :
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
                $el.transition()
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

<style lang="scss">
.overlay {
    position: fixed;
    bottom: 0;
    background: #fff;
    overflow: hidden;
    box-shadow: 0 0 25px rgba(0, 0, 0, 0.1);
}
</style>
