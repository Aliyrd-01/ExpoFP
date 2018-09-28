<template>
    <OverlayScrollable v-if="show" @close='handleCloseAndBack' @back='handleCloseAndBack' back-mode='menu'>
        <template slot="bar">
            <div class="bar">
                {{selectedCategory.name}}&nbsp;<span>({{categoryExhibitors.length}})</span>
                <div class='note'>Category</div>
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
         ...mapState(["details", "menu"]),
        ...mapGetters(["selectedCategory", "categoryExhibitors"]),
        show() {
            return !this.details && !this.menu && this.selectedCategory;
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
    /* line-height: 1em; */
    font-weight: 500;
    color: #333;
    > span {
        color: #aaa;
    }
    padding: 0.5rem 0;
}
.note {
    font-size: 0.7rem;
    color: #aaa;
    display: block;
    font-weight: normal;
}
</style>
