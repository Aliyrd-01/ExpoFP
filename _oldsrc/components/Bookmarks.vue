<template>
    <OverlayContent v-if="show" @close='handleCloseAndBack' @back='handleCloseAndBack' back-mode='menu'>
        <template slot="bar">
            <div class="bar">
                Bookmarks&nbsp;<span>({{bookmarkedArray.length}})</span>
            </div>
        </template>
        <List />
    </OverlayContent>
</template>

<script lang="ts">
import { mapGetters, mapState } from "vuex";
import List from "./List.vue";
import OverlayContent from "./OverlayContent.vue";

export default {
    components: { List, OverlayContent },
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
    font-weight: 600;
    color: #333;
    > span{
        color: #aaa;
        font-weight: 400;
    }
}
</style>
