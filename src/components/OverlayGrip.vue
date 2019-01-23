<template>
    <a href='' class="overlay-grip" :class="{arr}" @click.prevent="handleClick">
        <svg viewBox="0 0 1200 200" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
            <path d="M100,100 l 500 100 L 1100 100" />
            <path d="M100,150 l 500 0 L 1100 150" />
        </svg>
    </a>
</template>

<script lang="ts">
import { mapGetters, mapState } from "vuex";
export default {
    components: {},
    computed: {
        ...mapState(["overlaySize"]),
        arr() {
            return this.overlaySize === "full";
        }
    },
    methods: {
        handleClick() {
            this.$store.dispatch("toggleMapOverlay");
        }
    }
};
</script>

<style lang="scss">
.overlay-grip {
    $h: 1rem;
    $w: 3rem;
    $s: 0.2rem;
    display: block;
    position: absolute;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: $w;
    height: $h;
    z-index: 2;

    > svg{
        width: $w;
        height: $h;
        display: block;
        > path{
            stroke: #bbb;
            stroke-width: 90;
            fill: none;
            stroke-linecap: round;
            &:first-child{
                display: none;
            }
        }
    }
}
</style>
