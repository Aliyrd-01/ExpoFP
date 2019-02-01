<template>
    <SimpleRow :slug="category.slug" @click="click" :line1="`${category.name} (${numOfExhibitors})`" :line2='"Category"' />
</template>

<script lang="ts">

import SimpleRow from "./SimpleRow.vue";

export default {
    name: "CategoryRow",
    components: { SimpleRow },
    props: ["category"],
    methods: {
        click() {
            this.$store.dispatch("clickCategory", this.category.id);
        },
    },
    computed: {
        numOfExhibitors: function () {
            return this.$store.getters.exhibitorsArray.filter(e =>
                e.categories.indexOf(this.category.id) !== -1).length;
        }
    }
};
</script>

<style lang="scss">
</style>
