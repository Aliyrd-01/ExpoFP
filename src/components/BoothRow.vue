<template>
    <SimpleRow :slug="booth.slug" @click="click" :line1="`${booth.name}`" :line2='"Booth"' />
</template>

<script lang="ts">

import SimpleRow from "./SimpleRow.vue";

export default {
    name: "CategoryRow",
    components: { SimpleRow },
    props: ["booth"],
    methods: {
        click() {
            this.$store.dispatch("clickBooth", this.booth.id);
        },
    }
};
</script>

<style lang="scss">
</style>
