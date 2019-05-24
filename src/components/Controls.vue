<template>
    <div class="controls" :class="{ '-ready': ready }">
        <button class="fa fa-plus" title="Zoom In" @click="zoom(1)"></button>
        <button class="fa fa-minus" title="Zoom Out" @click="zoom(-1)"></button>
    </div>
</template>

<script lang="ts">
export default {
    data: () => ({ ready: false }),
    computed: {

    },
    mounted() {
        window.setTimeout(() => {
            this.ready = true;
        }, 2000);
    },
    methods: {
        zoom(val) {
            this.$store.commit("setZoomBy", val);
        }
    }
};
</script>
<style lang="scss">
.controls {
    position: fixed;
    top: 10px;
    right: 10px;
    opacity: 0;
    transition: 500ms opacity;
    &.-ready {
        opacity: 1;
    }
    $s: 2rem;
    > .fa-plus {
        margin-bottom: 0.5rem;
    }
    > .fa {
        padding: 0;
        background: #fff;
        outline: none;
        border: none;
        box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.3);
        border-radius: 2px;
        display: block;
        font-size: 0.75rem;
        line-height: $s;
        height: $s;
        width: $s;
        cursor: pointer;
        color: #777;
        .overlay-left &:hover {
            color: #111;
        }

        &:active {
            color: #111;
            background: #f1f1f1;
        }
    }

    .overlay-bottom & {
        top: 65px;
        right: unset;
        left: 10px;
        /* display: none; */
    }
}
</style>