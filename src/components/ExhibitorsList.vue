<template>
    <div class="list">
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
