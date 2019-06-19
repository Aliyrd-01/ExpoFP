<template>
    <OverlayContent v-if="show" @close='handleCloseAndBack' @back='handleCloseAndBack' back-mode='menu'>
        <template slot="bar">
            <div class="bar">
                {{selectedCategory.name}}&nbsp;<span>({{categoryExhibitors.length}})</span>
                <div class='note'>Category</div>
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
    min-height: 2.5rem;
    margin-top: 1rem;
    /* margin-left: 1rem; */
    font-size: 1.1em;
    /* line-height: 1em; */
    font-weight: 600;
    color: #333;
    > span {
        color: #aaa;
        font-weight: 400;
    }
    // padding: 0.5rem 0;
}
.note {
    font-size: 0.7rem;
    color: #aaa;
    display: block;
    font-weight: normal;
    margin-top: -0.2rem;
}
</style>
