<template>
    <a href='' class="overlay-grip" :class="{arr}" @click.prevent="handleClick">
        <span></span>
        <span></span>
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
            // switch (this.overlaySize) {
            //     case "full":

            //         break;
            //     case "small":
            //     case "medium":
            //         this.$store.dispatch("showOverlay");
            //         break;
            // }
            // if (this.arr) {
            //     this.$store.dispatch("showMap");
            // }
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

    > span {
        top: 0.5rem;
        position: absolute;
        width: $w/2;
        height: 0.2rem;
        background-color: #bbb;
        display: inline-block;
        transition: transform 0.2s ease;
        border-radius: 1rem;
        &:first-child {
            right: $w/2 - $s * 0.6;
        }
        &:last-child {
            left: $w/2 - $s * 0.6;
        }
    }

    &.arr {
        > span {
            &:first-child {
                transform: rotate(15deg);
            }
            &:last-child {
                transform: rotate(-15deg);
            }
        }
    }
}
</style>
