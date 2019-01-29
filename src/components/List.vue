<template>
    <div>
        <template v-for="item in items">
            <ExhibitorRow :exhibitor='item.obj' :key="`e${item.obj.id}`" v-if='item.type === "exhibitor"' />
            <CategoryRow :category='item.obj' :key="`c${item.obj.id}`" v-else-if='item.type === "category"' />
            <BoothRow :booth='item.obj' :key="`c${item.obj.id}`" v-else-if='item.type === "booth"' />
        </template>
    </div>
</template>

<script lang="ts">
import { mapGetters, mapState } from "vuex";
import { rtp } from "@/utils";
import ExhibitorRow from "./ExhibitorRow.vue";
import CategoryRow from "./CategoryRow.vue";
import BoothRow from "./BoothRow.vue";

const n = Math.ceil((Math.max(window.innerHeight, window.innerWidth) - rtp(3.5 + 2)) / rtp(3.5));
console.log('List n:', n);

export default {
    components: { ExhibitorRow, CategoryRow, BoothRow },
    computed: {
        ...mapState(["overlayShowsAll"]),
        ...mapGetters(["listItems"]),
        items() {
            console.log('', this.listItems)
            if (this.overlayShowsAll || this.listItems.length <= n) return this.listItems;
            return this.listItems.slice(0, n);
        },
    }
};
</script>

<style scoped lang="scss">
</style>
