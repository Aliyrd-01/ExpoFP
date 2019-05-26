<template>
    <a href='https://expofp.com/' target="_blank" class='logo-overlay' :style='style'><img src='expofp-overlay.png'></a>

</template>

<script lang="ts">
import { mapGetters, mapState } from "vuex";
import { remsToPixels } from './Map/utils';
export default {
    // props: ["scrolled", "backMode", "hideClose"],
    // components: {}
    computed: {
        ...mapState(["wsStarted"]),
        ...mapGetters([
            "overlayPosition",
            "mapVisibleTop",
            "mapVisibleBottom",
        ]),
        style() {
            const pad = this.overlayPosition === "left" ? remsToPixels(1) : remsToPixels(0.5);
            let style: any;
            if (this.overlayPosition === "left") style = { bottom: (this.mapVisibleBottom + pad) + 'px', right: pad + 'px', width: '5rem' };
            else style = { top: (this.mapVisibleTop + pad) + 'px', right: pad + 'px', width: '3rem' };
            style.opacity = this.wsStarted ? 1 : 0;
            return style;
        }
    }
};
</script>

<style lang="scss">
.logo-overlay {
    display: block;
    position: fixed;
    /* bottom: 1rem; */
    /* right: 0.5rem; */
    /* opacity: 0; */
    transition: opacity 0.5s;

    > img {
        display: block;
        width: 100%;
    }
}
</style>
