<template>
    <div class="overlay-content">
        <OverlayBar :scrolled='scrolled' @close='handleClose' :hide-close='hideClose' :back-mode='backMode' @back="$emit('back')">
            <slot name="bar" />
        </OverlayBar>
        <div class='overlay-content__scrollable' ref='scrollable'>
            <slot />
        </div>
    </div>
</template>

<script lang="ts">
import OverlayBar from "./OverlayBar.vue";
import PerfectScrollbar from "perfect-scrollbar";
import isScrollUgly from "@/utils/is-scroll-ugly";

export default {
    props: ["backMode", "hideClose"],
    data: () => ({
        scrolled: false
    }),
    components: {
        OverlayBar
    },
    mounted() {
        const sel = this.$refs.scrollable;

        if (isScrollUgly) {
            const ps = new PerfectScrollbar(sel);
            window.addEventListener("resize", () => ps.update());
            sel.addEventListener("ps-scroll-y", e => {
                this.scrolled = sel.scrollTop > 0;
                console.log("scrolled", sel.scrollTop, this.scrolled);
            });
            const observer = new MutationObserver(() => ps.update());
            observer.observe(sel, { childList: true, subtree: true });
        }
    },
    methods: {
        handleClose() {
            this.$emit("close");
        }
    }
};
</script>

<style lang="scss">
.overlay-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    &__scrollable {
        flex-grow: 1;
        height: 1px;
        overflow-y: hidden;
        position: relative;

        .overlay.full & {
            overflow-y: scroll;
            -webkit-overflow-scrolling: touch;
        }
    }
}
</style>
