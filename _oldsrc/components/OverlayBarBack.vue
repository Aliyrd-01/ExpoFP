<template>
    <div class='overlay-bar-back' :class="divClass" v-if='backMode !== "none"'>
        <i class='overlay-bar-back__icon1 far' :class="icon1Class"></i>
        <a class='overlay-bar-back__icon2 far' :class="icon2Class" href='/' @click.prevent='handleClick'></a>
    </div>
</template>

<script lang="ts">
import { mapState, mapGetters } from "vuex";

export default {
    props: {
        enableAnimation: Boolean, // false for mobile
        backMode: String //back/menu/none
    },
    data: () => {
        return { animationEnded: true };
    },
    computed: {
        divClass() {
            return {
                anim: this.enableAnimation,
                end: this.animationEnded,
                start: !this.animationEnded
            };
        },
        showBack() {
            return this.backMode === "back";
        },
        icon1Class() {
            return `${!this.showBack ? "fa-chevron-left" : "fa-bars"}`;
        },
        icon2Class() {
            return `${this.showBack ? "fa-chevron-left" : "fa-bars"}`;
        }
    },
    watch: {
        showBack: function () {
            this.animationEnded = false;
            if (this.backTimeout) window.clearTimeout(this.backTimeout);
            this.backTimeout = window.setTimeout(() => {
                this.animationEnded = true;
            }, 20);
        }
    },
    methods: {
        handleClick() {
            if (this.showBack) this.$emit("back");
            else this.$store.commit("setMenu", true);
        }
    }
};
</script>

<style scoped lang="scss">
.overlay-bar-back {
    min-width: 3rem;
    height: $overlay-height;
    align-self: flex-start;
    position: relative;
    display: flex;

    &__icon1,
    &__icon2 {
        position: absolute;
        @include overlay-bar-icon;
    }

    &.anim.end > &__icon1 {
        transition: all 0.3s;
        transform: rotate(-180deg);
    }
    &.end > &__icon1,
    &.start > &__icon2 {
        opacity: 0;
    }

    &.anim.end > &__icon1.fa-chevron-left,
    &.anim.start > &__icon2.fa-chevron-left {
        transform: rotate(180deg);
    }

    &.start > &__icon2.fa-bars {
        transform: rotate(-180deg);
    }
    &.anim.end > &__icon2 {
        transition: all 0.3s;
    }
}
</style>
