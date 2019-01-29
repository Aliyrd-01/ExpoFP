<template>
    <div class="list">
        <!-- <div v-for="item in $store.getters.listExhibitors" :key="item.id" :exhibitor='item' style="height: 3rem" /> -->
        <ExhibitorRow v-for="item in exhibitors" :key="item.id" :exhibitor='item' />
    </div>
</template>

<script lang="ts">
import { mapGetters, mapState } from "vuex";
import {rtp} from "@/utils";
import ExhibitorRow from "./ExhibitorRow.vue";

const n = Math.ceil((Math.max(window.innerHeight, window.innerWidth) - rtp(3.5 + 2)) / rtp(3.5));
console.log('List n:', n);

export default {
    components: { ExhibitorRow },
    computed: {
        ...mapState(["overlayShowsAll"]),
        ...mapGetters(["listExhibitors"]),
        exhibitors() {
            if (this.overlayShowsAll || this.listExhibitors.length <= n) return this.listExhibitors;
            return this.listExhibitors.slice(0, n);
        }
    }
};
</script>

<style scoped lang="scss">
</style>
