<template>
    <div class="overlay-grip">
        <div class="overlay-grip__line"></div>
    </div>

</template>

<script lang="ts">
export default {
    components: {}
};
</script>

<style lang="scss">
.overlay-grip {
    position: absolute;
    /* top: 0;
    left: 0; */
    width: 100%;
    height: 0.5rem;
    /* padding-bottom: 0.4rem; */
    z-index: 2;

    display: flex;
    align-items: flex-end;
    justify-content: center;
    /* background: #f1f1f1; */

    &__line {
        width: 3rem;
        background: #bbb;
        height: 0.2rem;
        border-radius: 1em;
    }
}
</style>
