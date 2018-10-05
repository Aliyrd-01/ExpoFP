<template>
    <div class="overlay-bar" :class='{scrolled}'>
        <OverlayBarBack :back-mode='backMode || "menu"' :enable-animation="true" @back='$emit("back")' />
        <div class='overlay-bar__slot'>
            <slot />
        </div>
        <a class="far fa-times overlay-bar__close" href='/' @click.prevent='$emit("close")' v-if='!hideClose'></a>
    </div>

</template>

<script lang="ts">
import OverlayBarBack from "./OverlayBarBack.vue";

export default {
    props: ["scrolled", "backMode", "hideClose"],
    components: { OverlayBarBack }
};
</script>

<style lang="scss">

.overlay-bar {
    display: flex;
    align-items: center;
    --size: 3.5rem;
    background-color: #fff;
    z-index: 1;
    transition: box-shadow 300ms;

    &__slot {
        flex-grow: 1;
    }

    &__close {
        @include overlay-bar-icon;
    }
}
.overlay-bar.scrolled {
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
}

/* .overlay-bar >>> .far {
    height: var(--size);
    min-width: var(--iconWidth);
    line-height: var(--size);
    text-align: center;
    font-size: 1.3rem;
    text-decoration: none;
    color: #999999;
    align-self: flex-start;
} */


</style>
