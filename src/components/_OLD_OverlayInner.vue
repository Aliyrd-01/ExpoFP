<template>
    <div class="overlay-inner">
        <OverlayBar :scrolled='scrolled' />
        <div class='overlay-scrollable' ref='scrollable'>
            <List v-if="detailsType === null" />
            <Booth v-if="detailsType === 'booth'" />
            <Exhibitor v-if="detailsType === 'exhibitor'" />
        </div>
    </div>

</template>

<script lang="ts">
import OverlayBar from "./OverlayBar.vue";
import List from "./List.vue";
import Exhibitor from "./Exhibitor.vue";
import Booth from "./Booth.vue";
import PerfectScrollbar from "perfect-scrollbar";

export default {
    // name: "OverlayContent",
    data: () => ({
        scrolled: false
    }),
    components: {
        OverlayBar,
        List,
        Booth,
        Exhibitor
    },
    mounted() {
        const sel = this.$refs.scrollable;
        const ps = new PerfectScrollbar(sel);
        window.addEventListener("resize", () => ps.update());
        sel.addEventListener("ps-scroll-y", e => {
            this.scrolled = sel.scrollTop > 0;
            console.log("scrolled", sel.scrollTop, this.scrolled);
        });

        const observer = new MutationObserver(() => ps.update());
        observer.observe(sel, { childList: true, subtree: true });
    },
    watch: {
        detailsType() {
            this.$refs.scrollable.scrollTop = 0;
        }
    },
    computed: {
        detailsType() {
            const d = this.$store.state.details;
            if (!d) return null;
            return d.type;
        }
    }
};
</script>

<style scoped>
.overlay-inner {
    height: 100%;
    display: flex;
    flex-direction: column;
}
.overlay-scrollable {
    flex-grow: 1;
    height: 1px;
    overflow-y: hidden;
    position: relative;
}
</style>
<style>
.full .overlay-scrollable {
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
}
</style>
