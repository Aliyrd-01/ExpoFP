<template>
    <div class="list">
          <!-- <div v-for="item in $store.getters.listExhibitors" :key="item.id" :exhibitor='item' style="height: 3rem" /> -->
        <ExhibitorRow v-for="item in $store.getters.listExhibitors" :key="item.id" :exhibitor='item' />
    </div>
</template>

<script lang="ts">
import ExhibitorRow from "./ExhibitorRow.vue";

export default {
    components: { ExhibitorRow }
};
</script>

<style scoped lang="scss">
</style>
