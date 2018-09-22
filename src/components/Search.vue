<template>
    <OverlayScrollable v-if="show">
        <ExhibitorRow v-for="item in filteredExhibitors" :key="item.id" :exhibitor='item' />
    </OverlayScrollable>
</template>

<script lang="ts">
import { mapGetters, mapState } from "vuex";
import ExhibitorRow from "./ExhibitorRow.vue";
import OverlayScrollable from "./OverlayScrollable.vue";

export default {
    name: "List",
    components: { ExhibitorRow, OverlayScrollable },
    mounted(){
        // console.log('mounted', this.$el)
    },
    computed: {
        ...mapGetters(["filteredExhibitors"]),
        show(){ return !this.$store.state.details; }
    }
};
</script>

<style scoped>
</style>
