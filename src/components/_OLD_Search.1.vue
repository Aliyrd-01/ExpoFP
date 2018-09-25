<template>
    <OverlayScrollable v-if="show">
        <template slot="bar">
            <div class="bar">
                <input type="search" ref="input" v-if="!showTitle" :class={fixed:hideRealInput} :placeholder="placeHolder" :value="searchText" @input="setSearchText" @focus="handleFocus" @blur="handleBlur" />
                <input type="search" ref="inputReplica" v-if="!showTitle && hideRealInput" :placeholder="placeHolder" :value="searchText" @focus.prevent="handleReplicaFocus" />
            </div>
        </template>
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
    mounted() {
        // console.log('mounted', this.$el)
    },
    computed: {
        ...mapGetters(["filteredExhibitors"]),
        show() {
            return !this.$store.state.details;
        }
    }
};
</script>

<style scoped lang="scss">
</style>
