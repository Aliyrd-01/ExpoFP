<template>
    <OverlayScrollable v-if="show" @close='handleCloseAndBack' @back='handleCloseAndBack' back-mode='none'>
        <template slot="bar">
            <div class="bar">
                {{selectedCategory.name}}&nbsp;<span>({{categoryExhibitors.length}})</span>
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
        ...mapGetters(["selectedCategory", "categoryExhibitors"]),
        show() {
            return this.selectedCategory;
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
    margin-left: 1rem;
    font-size: 1.1em;
    font-weight: 500;
    color: #333;
    > span{
        color: #aaa;
    }
}
</style>
