<template>
    <canvas class="overlay__particles" :class="{'-visible': visible}" v-if='canShow'></canvas>
</template>
<script lang="ts">

import { mapGetters, mapState } from "vuex";

function waitFor(func, callback) {
    const val = func();
    // if (val) {
    //     callback(val);
    // } else {
    const intervalId = window.setInterval(function () {
        const val = func();
        if (val) {
            window.clearInterval(intervalId);
            callback(val);
        } else {
            console.log('OverlayPartiles no Particles so far')
        }
    }, 500);
    // }
}

export default {
    data: () => ({ visible: false }),
    computed: {
        ...mapGetters([
            "overlayPosition"
        ]),
        canShow() {
            return this.overlayPosition === 'left';
        }
    },

    watch: {
        canShow(val) {
            if (!val) this.stop();
        }
    },

    mounted() {
        if (!this.canShow) return;
        this.starting = true;

        // btw, we do not want it immediately - it can be broken sometimes
        waitFor(() => window['Particles'], Particles => {
            if (!this.starting) return;
            this.visible = true;

            this.particles = Particles.init({
                selector: '.overlay__particles',
                maxParticles: 50,
                speed: 0.4,
                sizeVariations: 4,
                color: '#557988',
                connectParticles: true
            });
        });
    },
    beforeDestroy() {
        this.stop();
    },
    methods: {
        stop() {
            this.starting = false;
            if (this.particles) {
                this.particles.destroy();
                this.particles = null;
            }
        }
    }
};

</script>
<style lang="scss">
.overlay__particles {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    opacity: 0;
    transition: opacity 1s;
    &.-visible {
        opacity: 1;
    }
}
</style>