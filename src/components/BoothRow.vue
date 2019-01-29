<template>
    <a :href='"?" + encodeURIComponent(booth.slug)' @click.prevent='click' class="booth-row">
        {{booth.name}}
    </a>
</template>

<script lang="ts">
export default {
    name: "CategoryRow",
    props: ["booth"],
    methods: {
        click() {
            this.$store.dispatch("clickBooth", this.booth.id);
        },
    },
    computed: {

    }
};
</script>

<style lang="scss">
.booth-row {
    display: block;
}
</style>
