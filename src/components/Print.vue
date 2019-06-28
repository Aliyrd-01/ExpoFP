<template>
    <div class="print" v-if='visible'>
        <h1>{{__data.title}}</h1>
        <h2>{{__data.subtitle}}</h2>
        <canvas ref='canvas' class="print__canvas"></canvas>
    </div>
</template>

<script lang="ts">

// import Message from "./Message.vue";
import { mapGetters, mapState } from "vuex";
import createDrawer from './Map/drawing/drawer';

export default {
    // name: 'app',
    components: {

    },
    data: () => ({ visible: false }),
    computed: {
        // title() {
        //     let title = __data.title;
        //     if (__data.subtitle) title += " – " + __data.subtitle;
        //     return title;
        // }
    },
    mounted() {
        window.addEventListener("beforeprint", () => {
            this.visible = true;
        });
        window.addEventListener("afterprint", () => {
            this.visible = false;
        });
    },
    updated: function () {
        if (!this.visible) return;
        const canvas = this.$refs['canvas'];
        canvas.width = 3000;
        canvas.height = 3000;
        const drawer = createDrawer(canvas, false);
        drawer.setPixelRatio(2);
        drawer.draw();
    },
    watch: {
        visible(val) {
            this.$emit('printing-change', val);
        }
    }
};
</script>

<style lang="scss">
.print {
    position: absolute;
    top: 0;
    z-index: 999;
    background: #fff;
    /* min-height: 100vh; */
    width: 100%;

    text-align: center;

    &__canvas {
        max-width: 100%;
        max-height: 100%;
    }

    > h1 {
        font-size: 2rem;
        margin: 0.5rem 0 0;
    }
    > h2 {
        font-size: 1.5rem;
        color: #555;
        margin: 0.5rem 0 1rem;
    }
    /* p {
        min-height: 20vh;
    }
     */
}
</style>
