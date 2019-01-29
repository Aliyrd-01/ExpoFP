<template>
    <a :href='"?" + encodeURIComponent(category.slug)' @click.prevent='click' class="category-row">
        {{category.name}}
    </a>
</template>

<script lang="ts">
export default {
    name: "CategoryRow",
    props: ["category"],
    methods: {
        click() {
            this.$store.dispatch("clickCategory", this.category.id);
        },
    },
    computed: {

    }
};
</script>

<style lang="scss">
.category-row {
    display: block;
}
</style>
