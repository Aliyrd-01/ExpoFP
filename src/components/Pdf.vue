<template>
    <div class="pdf" v-if="show">
        <h1>Generating PDF...</h1>
    </div>
</template>

<script lang="ts">

// import Message from "./Message.vue";
import { mapGetters, mapState } from "vuex";
import createDrawer from './Map/drawing/drawer';
// import jsPDF from 'jspdf';

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
    watch: {
        show(val) {
            if (val) {
                //alert('Printing...');

                window.setTimeout(async () => {
                    const { default: jsPDF } = await import('jspdf');
                    const doc = new jsPDF();//window['jsPDF']();
                    doc.setFontSize(30);
                    doc.text(__data.title, 25, 25);

                    const canvas = document.createElement("canvas");
                    canvas.width = 3000;
                    canvas.height = 3000;
                    const drawer = createDrawer(canvas, false);
                    drawer.setPixelRatio(2);
                    drawer.draw();

                    doc.addImage(canvas, 'JPEG', 15, 40, 180, 180);

                    doc.save('Floor Plan.pdf')

                    //this.$store.commit('setPrintingPdf', false);
                }, 500);
            }
        }
    }
};
</script>

<style lang="scss">
.pdf {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 999;
}
</style>
