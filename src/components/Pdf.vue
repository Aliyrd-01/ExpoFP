<template>
    <div class="pdf" v-if="show" :class="{'-visible': visible}">
        <div class="pdf__text">Preparing PDF...</div>
    </div>
</template>

<script lang="ts">

// import Message from "./Message.vue";
import { mapGetters, mapState } from "vuex";
// import jsPDF from 'jspdf';

export default {
    // name: 'app',
    components: {

    },
    data: () => ({ visible: false }),
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

                window.setTimeout(() => {
                    this.visible = true;
                }, 10);

                window.setTimeout(async () => {

                    const { generatePdf } = await import('@/tools/pdf');
                    await generatePdf();

                    window.setTimeout(() => {
                        this.visible = false;
                        window.setTimeout(() => {
                            this.$store.commit('setPrintingPdf', false);
                        }, 300);
                    }, 2000);

                }, 300);
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
    background: rgba(0, 0, 0, 0.8);
    z-index: 999;
    opacity: 0;
    transition: opacity 300ms;

    &__text {
        text-align: center;
        color: #eee;
        margin-top: 45vh;
        font-size: 2rem;
        font-weight: 400;
    }

    &.-visible {
        opacity: 1;
    }
}
</style>
