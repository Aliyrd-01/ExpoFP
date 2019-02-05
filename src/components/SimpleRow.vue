<template>
    <a :href='"?" + encodeURIComponent(slug)' @click.prevent='click' class="simple-row" :class='{active}' @mouseover='$emit("mouseover")' @mouseout='$emit("mouseout")'>
        <div class="simple-row__main">{{line1}}</div>
        <div class="simple-row__sub">{{line2}}</div>
    </a>
</template>

<script lang="ts">
export default {
    name: "SimpleRow",
    props: ["line1", "line2", "slug", "active"],
    methods: {
        click() {
            this.$emit("click");
        },
    }
};
</script>

<style lang="scss">
.simple-row {
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-decoration: none !important;
    color: #333 !important;
    $p: 1rem;

    &__main {
        padding: 0 $p 0;
        height: 1.3125rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-weight: 500
    }

    &__sub {
        font-size: 0.7rem;
        color: #aaa;
        padding: 0 0 0 $p;
        height: 0.7rem;
        margin: -2px 0;
    }
}
</style>
