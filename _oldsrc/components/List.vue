<template>
    <div>
        <template v-for="(item, index) in items">
            <ExhibitorRow :exhibitor='item.obj' :key="`e${item.obj.id}`" v-if='item.type === "exhibitor"' class='list-row'
                :class='{active: index === activeListIndex}' />
            <CategoryRow :category='item.obj' :key="`c${item.obj.id}`" v-else-if='item.type === "category"' class='list-row'
                :class='{active: index === activeListIndex}' />
            <BoothRow :booth='item.obj' :key="`c${item.obj.id}`" v-else-if='item.type === "booth"' class='list-row'
                :class='{active: index === activeListIndex}' />
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
__logger.log('List n:', n);

export default {
    components: { ExhibitorRow, CategoryRow, BoothRow },
    computed: {
        ...mapState(["overlayShowsAll", "activeListIndex"]),
        ...mapGetters(["listItems"]),
        items() {
            // __logger.log('', this.listItems)
            if (this.overlayShowsAll || this.listItems.length <= n) return this.listItems;
            return this.listItems.slice(0, n);
        },
    },
    updated: function () {
        const el = document.querySelector('.list-row.active');
        if (el) el.scrollIntoView({ block: "nearest", inline: "nearest" });
        // this.$nextTick(function () {
        //     __logger.log('activiting')

        // })
    },
    // watch: {
    //     activeListIndex(idx) {
    //         __logger.log('activeListIndex', idx);
    //         const el = document.querySelector('.list-row.active');
    //         if (el) el.scrollIntoView(false);
    //         window.setTimeout(() => {

    //         }, 1);
    //     }
    // }
};
</script>

<style lang="scss">
.list-row {
    border-top: solid 1px #ebebeb;
    min-height: 3.5rem;
    @media (hover: hover) {
        &.active {
            background: #eee;
        }
        &:hover,
        &.active:hover {
            background-color: #f1f1f1;
        }
    }
}
</style>
