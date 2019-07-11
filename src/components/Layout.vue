<template>
    <div class=layout>
        <div class="layout__fixed" :class='classes'>
            <LogoOverlay />
            <Ws />
            <Controls />
            <Areas />
            <Overlay />
            <Map v-if="mapReady && webGlSupported" />
            <Demo />
            <Debug />
            <Pdf v-if="webGlSupported" />
            <div id="fps"></div>
        </div>
    </div>
</template>

<script lang="ts">

import Overlay from "./Overlay.vue";
import LogoOverlay from "./LogoOverlay.vue";
import Controls from "./Controls.vue";
import Demo from "./Demo.vue";
import Ws from "./Ws.vue";
import Pdf from "./Pdf.vue";
import Map from "./Map/Map.vue";
import { mapGetters, mapState } from "vuex";
import { remsToPixels, isWebGlSupported } from './Map/utils';
import Vue from 'vue';

const webGlSupported = isWebGlSupported();
const dummy = { render: () => null };
const Debug = __settings.debug ? () => import(/* webpackChunkName: "Debug.vue" */'./Debug.vue') : dummy;
const Areas = webGlSupported && EFP_EXPO === "cbresupplypartner" ? () => import( /* webpackChunkName: "Areas.vue" */ './Areas.vue') : dummy;

export default {
    // name: 'app',
    components: {
        LogoOverlay,
        Overlay,
        Map,
        Debug,
        Controls,
        Areas,
        Ws,
        Demo,
        Pdf,
    },
    data: () => ({ mapReady: false, webGlSupported }),
    computed: {
        expo() {
            return EFP_EXPO;
        },
        ...mapGetters([
            "overlayPosition"
        ]),
        classes() {
            return `expo-${EFP_EXPO} overlay-${this.overlayPosition}`;
        }
    },
    mounted() {
        function doSet(cause) {
            if (this.mapReady) return;
            __logger.log("mapReady", cause);
            this.mapReady = true;
        }

        window.setTimeout(doSet.bind(this, "timeout"), 5000);
        window.addEventListener("load", doSet.bind(this, "load"))
        const f = document['fonts'];
        if (f && f.ready) f.ready.then(doSet.bind(this, "ready"));

        // window.setTimeout(() => {
        //     (document.querySelector('.logo-overlay') as HTMLAnchorElement).style.opacity = "1";
        // }, 3000);
    },
};
</script>

<style lang="scss">
:root {
    --error-color: red;
    --color: #34a1e6;
    --color-light: #44aef1;
    --color-dark: #337caa;
    --link-color: #13a1de;
    --link-color-hover: #13a1de;
}
* {
    font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif;
    -webkit-tap-highlight-color: transparent;
}
html,
body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    /* font-size: 16px; */
    @media (max-width: 820px) and (min-width: 500px) and (orientation: portrait) {
        font-size: 13px;
    }
    /* @media (max-width: 820px) and (orientation: portrait) {
        font-size: 16px;
    } */
}
.layout {
    // font-size: 15px;
    &__fixed {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        /* background: #ebebeb; */
        overflow: hidden;
    }
    /* &media print {
        &__fixed {
            visibility: hidden;
        }
    } */
}
a {
    color: var(--link-color);
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;
}

a:hover,
a:visited {
    color: var(--link-color-hover);
    text-decoration: underline;
}

#fps {
    position: fixed;
    top: 10px;
    right: 10px;
    font-size: 10px;
    z-index: 999;
}
.fa-phone {
    transform: scaleX(-1);
}
</style>
