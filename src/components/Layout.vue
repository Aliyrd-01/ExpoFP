<template>
    <div id="root" :class='"expo-" + expo + " overlay-" + overlayPosition'>
        <a href='https://expofp.com/' target="_blank" class='logo-overlay' :style='{"margin-top": `${wsFullHeightPx}px`}'><img
                src='expofp-overlay.png'></a>
        <Ws />
        <Overlay />
        <Map v-if="mapReady" />
        <Controls />
        <Demo />
        <!-- <Message /> -->
        <Debug />
        <div id="fps"></div>
    </div>
</template>

<script lang="ts">

import Overlay from "./Overlay.vue";
import Map from "./Map/Map.vue";
import Controls from "./Controls.vue";
import Debug from "./Debug.vue";
import Ws from "./Ws.vue";
import Demo from "./Demo.vue";
// import Message from "./Message.vue";
import { mapGetters, mapState } from "vuex";
import { remsToPixels } from './Map/utils';

export default {
    // name: 'app',
    components: {
        Overlay,
        Map,
        Controls,
        Ws,
        Debug,
        Demo,
        // Message
    },
    data: () => ({ mapReady: false }),
    computed: {
        expo() {
            return EFP_EXPO;
        },
        ...mapGetters([
            "overlayPosition",
            "wsFullHeightPx",
        ])
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

        window.setTimeout(()=>{
            (document.querySelector('.logo-overlay') as HTMLAnchorElement).style.opacity = "1";
        }, 3000);
    }
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
#root {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #ebebeb;
    overflow: hidden;
    // font-size: 15px;
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

.logo-overlay {
    display: block;
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    opacity: 0;
    transition: opacity 0.5s;

    .overlay-bottom & {
        top: 0.5rem;
        right: 0.5rem;
        bottom: unset;
        > img {
            width: 3rem !important;
        }
    }
    > img {
        display: block;
        width: 5rem;
    }
}
#fps {
    position: fixed;
    top: 10px;
    right: 10px;
    font-size: 10px;
    z-index: 999;
}
.fa-phone{
    transform: scaleX(-1);
}
</style>
