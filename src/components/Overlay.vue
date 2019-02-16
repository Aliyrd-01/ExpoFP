<template>
    <div :class='overlaySize + " " + overlayPosition' class="overlay">
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
import { rtp } from "@/utils";
import Menu from "./Menu.vue";
import Search from "./Search.vue";
import Bookmarks from "./Bookmarks.vue";
import Category from "./Category.vue";
import Exhibitor from "./Exhibitor.vue";
import Booth from "./Booth.vue";
// import { overlayWidthRems, overlayMediumHeightRems } from './sizes';


export default {
    components: {
        Menu,
        Search,
        Bookmarks,
        Category,
        Exhibitor,
        Booth
    },
    computed: {
        ...mapState(["overlaySize", "screenSize", "overlayWidthRems", "overlayMediumHeightRems"]),
        ...mapGetters(["overlayPosition"]),
        noMove() {
            return this.overlayPosition === "left";
        }
    },

    mounted: function () {
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
            const current = getTopForBottomPosition(this.$el, this.overlaySize);
            const medium = getTopForBottomPosition(this.$el, "medium");
            let newSize = this.overlaySize;
            if (diff < 0) {
                if (this.overlaySize === "medium" || current + diff > medium) newSize = "small";
                else if (this.overlaySize === "full") {
                    newSize = "medium";
                }
            } else if (diff > 0) {
                if (this.overlaySize === "medium" || current + diff < medium) newSize = "full";
                else if (this.overlaySize === "small") {
                    newSize = "medium";
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
            // console.log('Overlay positioning');
            const el = this.$el as HTMLDivElement;
            const position = this.overlayPosition as OverlayPosition;
            // let width: string, left: string, top: string;
            const s = el.style;
            // const w = "23.5rem";
            switch (position) {
                case "left":
                    s.width = this.overlayWidthRems + "rem";
                    s.top = "0";
                    s.left = "0";
                    s.height = undefined;
                    this.setShowAll();
                    break;
                case "bottom":
                    s.left = "0";
                    s.width = "100%";
                    this.setHeight();
                    break;
            }

            // el.style.width = width;
            // el.style.height = height;
            // el.style.left = left;
            // el.style.top = top;
        },

        setShowAll() {
            const all =
                this.overlayPosition === "left" ||
                getTopForBottomPosition(this.$el, "full") === this.$el.getBoundingClientRect().top;
            if (all !== store.state.overlayShowsAll) store.commit("setOverlayShowsAll", all);
        },

        setHeight() {
            // height depends on size and ongoing touch
            // let's animate when no touch in progress
            const position = this.overlayPosition as OverlayPosition;
            if (position === "left") return;

            let newTop = getTopForBottomPosition(this.$el, this.overlaySize);

            let transition = true;
            if (this.touchDiff !== undefined) {
                newTop -= this.touchDiff; // this.negateMove ? -this.touchDiff :
                const maxTop = getTopForBottomPosition(this.$el, "small");
                const minTop = getTopForBottomPosition(this.$el, "full");
                newTop = Math.min(Math.max(newTop, minTop), maxTop);
                transition = false;
            } else if (this.currentTop == undefined) {
                transition = false;
            }
            if (this.currentTop === newTop) return;
            const $el = d3.select(this.$el);
            $el.interrupt();
            if (transition) {
                $el.transition()
                    .ease(d3.easePolyOut)
                    .duration(500)
                    .style("top", newTop + "px")
                    .on("end", this.setShowAll);
            } else {
                this.$el.style.top = newTop + "px";
            }
            this.setShowAll();
            // this.$el.style.transition = transition ? "top 500ms" : undefined;
            // this.$el.style.top = newTop + "px";

            if (this.currentTop != newTop && window.event) window.event.preventDefault();
            this.currentTop = newTop;
        }
        // setHeight_Prev() {
        //     // height depends on size and ongoing touch
        //     // let's animate when no touch in progress
        //     const position = this.overlayPosition as OverlayPosition;
        //     if (position === "left") return;

        //     let newHeight = getHeight(this.$el, position, this.overlaySize);

        //     let transition = true;
        //     if (this.touchDiff !== undefined) {
        //         newHeight += this.touchDiff; // this.negateMove ? -this.touchDiff :
        //         const maxHeight = getHeight(this.$el, position, "full");
        //         if (newHeight > maxHeight) {
        //             newHeight = maxHeight;
        //         }
        //         transition = false;
        //     } else if (this.currentHeight == undefined) {
        //         transition = false;
        //     }
        //     if (this.currentHeight === newHeight) return;
        //     const $el = d3.select(this.$el);
        //     $el.interrupt();
        //     if (transition) {
        //         $el.transition()
        //             .ease(d3.easePolyOut)
        //             .duration(500)
        //             .style("height", newHeight + "px");
        //     } else {
        //         this.$el.style.height = newHeight + "px";
        //     }

        //     if (this.currentHeight != newHeight && window.event) window.event.preventDefault();
        //     this.currentHeight = newHeight;
        // }
    }
};

const miniSizeRems = 3.5;
const paddingRems = 2;

// function getHeight(el, position, size) {
//     const containerHeight = el.parentElement.getBoundingClientRect().height;
//     switch (position) {
//         case "left":
//             switch (size) {
//                 case "full":
//                     return containerHeight - rtp(paddingRems * 2);
//                 case "medium":
//                     return rtp(overlayMediumHeightRems);
//                 case "small":
//                     return rtp(miniSizeRems);
//             }
//             break;
//         case "bottom":
//             switch (size) {
//                 case "full":
//                     return containerHeight - rtp(paddingRems);
//                 case "medium":
//                     return rtp(overlayMediumHeightRems);
//                 case "small":
//                     return rtp(miniSizeRems);
//             }
//             break;
//     }
//     return null;
// }

function getTopForBottomPosition(el, size: OverlaySize): number {
    const containerHeight = el.parentElement.getBoundingClientRect().height;
    switch (size) {
        case "full":
            return rtp(paddingRems);
        case "medium":
            return window.innerHeight - rtp(store.state.overlayMediumHeightRems);
        case "small":
            return window.innerHeight - rtp(miniSizeRems);
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
    &.medium.bottom,
    &.small.bottom {
        border-radius: 0.5rem 0.5rem 0 0;
    }

    /* @media (min-width: 600px) {
         box-shadow: 0 0 25px rgba(0, 0, 0, 0.1);
    } */
}
</style>
