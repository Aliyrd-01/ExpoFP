<template>
    <div class="list">
        <ListRow v-for="item in filteredExhibitors" :key="item.id" :exhibitor='item' />
    </div>
</template>

<script lang="ts">
import { mapGetters, mapState } from "vuex";
import ListRow from "./ListRow.vue";

export default {
    name: "List",
    components: { ListRow },
    computed: {
        ...mapGetters(['filteredExhibitors']),
        // ...mapState(["exhibitors"]),
        // ...mapGetters(["categoriesArray", "exhibitorsArray", "boothsArray"]),
        // filteredExhibitors() {
        //     const exhibitorsArray = this.exhibitorsArray;
        //     let text = this.$store.state.searchText.trim().toLowerCase();
        //     if (!text) return exhibitorsArray;
        //     if (this.boothNameMap.has(text)) {
        //         const b = this.boothNameMap.get(text);
        //         return b.exhibitors.map(key => this.exhibitors[key]);
        //     }
        //     if (this.exhibitorsByCategoryNameMap.has(text)) {
        //         return this.exhibitorsByCategoryNameMap.get(text);
        //     }
        //     return exhibitorsArray.filter(e => e.name.toLowerCase().indexOf(text.toLowerCase()) !== -1);
        // },
        // boothNameMap() {
        //     const boothKeyArray = this.boothsArray.map(b => [b.name.toLowerCase(), b]);
        //     return new Map(boothKeyArray);
        // },
        // exhibitorsByCategoryNameMap() {
        //     const array = this.categoriesArray.map(c => [
        //         c.name.toLowerCase(),
        //         this.exhibitorsArray.filter(e => e.categories.indexOf(c.id) !== -1)
        //     ]);
        //     return new Map(array);
        // }
    }
};
</script>

<style scoped>
</style>
