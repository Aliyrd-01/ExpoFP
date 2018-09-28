<template>
    <OverlayScrollable v-if="show" @close='handleCloseAndBack' @back='handleCloseAndBack' back-mode='menu'>
        <template slot="bar">
            <div class="bar">
                My Bookmarks&nbsp;<span>({{bookmarkedArray.length}})</span>
            </div>
        </template>
        <ExhibitorsList />
    </OverlayScrollable>
</template>

<script lang="ts">
import { mapGetters, mapState } from "vuex";
import ExhibitorsList from "./ExhibitorsList.vue";
import OverlayScrollable from "./OverlayScrollable.vue";

export default {
    components: { ExhibitorsList, OverlayScrollable },
    computed: {
        ...mapState(["list", "details"]),
        ...mapGetters(["bookmarkedArray"]),
        show() {
            return !this.details && this.list.type === "bookmarks";
        }
    },
    methods: {
        handleCloseAndBack() {
            this.$store.dispatch("selectSearch");
        }
    }
};
</script>

<style scoped lang="scss">
.bar {
    /* margin-left: 1rem; */
    font-size: 1.1em;
    font-weight: 500;
    color: #333;
    > span{
        color: #aaa;
    }
}
</style>
