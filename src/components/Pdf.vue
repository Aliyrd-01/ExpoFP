<template>
    <div class="pdf" v-if="show">
        <h1>Generating PDF</h1>
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
    data: () => ({ visible: true }),
    computed: {
        ...mapState(["printingPdf"]),
        show() {
            return this.printingPdf;
        },
        // title() {
        //     let title = __data.title;
        //     if (__data.subtitle) title += " – " + __data.subtitle;
        //     return title;
        // }
    },
    mounted() {
    },
    // updated: function () {
    //     if (!this.visible) return;

    // },
    // watch: {
    //     visible(val) {
    //         this.$emit('printing-change', val);
    //     }
    // }
};
</script>

<style lang="scss">
.pdf{
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
}
</style>
