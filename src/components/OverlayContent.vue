<template>
    <div class="overlay-content">
        <OverlayBar/>
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
    components: {
        OverlayBar,
        List,
        Booth,
        Exhibitor
    },
    mounted() {
        const ps = new PerfectScrollbar(this.$refs.scrollable);
        window.addEventListener("resize", () => ps.update());

        const observer = new MutationObserver(() => ps.update());
        observer.observe(this.$refs.scrollable, { childList: true, subtree: true });
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
.overlay-content {
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
