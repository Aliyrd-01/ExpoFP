<template>
    <div :class="divClass" v-if='backMode !== "none"'>
        <i :class="icon1Class"></i>
        <a :class="icon2Class" href='/' @click.prevent='handleClick'></a>
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
            return `back ${this.enableAnimation ? "anim" : ""} ${this.animationEnded ? "end" : "start"}`;
        },
        showBack() {
            return this.backMode === "back";
        },
        icon1Class() {
            return `icon1 far ${!this.showBack ? "fa-chevron-left" : "fa-bars"}`;
        },
        icon2Class() {
            return `icon2 far ${this.showBack ? "fa-chevron-left" : "fa-bars"}`;
        }
    },
    watch: {
        showBack: function() {
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
.back {
    /* height: var(--size);
    min-width: var(--iconWidth); */
      @include overlay-bar-icon;
    position: relative;
    display: flex;
}

.icon1,
.icon2 {
    position: absolute;
}

.anim.back.end > .icon1 {
    transition: all 0.3s;
    transform: rotate(-180deg);
}
.back.end > .icon1 {
    opacity: 0;
}
.anim.back.end > .icon1.fa-chevron-left {
    transform: rotate(180deg);
}

.anim.back.start > .icon2 {
    transform: rotate(180deg);
}

.back.start > .icon2 {
    opacity: 0;
}

.back.start > .icon2.fa-bars {
    transform: rotate(-180deg);
}

.anim.back.end > .icon2 {
    transition: all 0.3s;
}
</style>
