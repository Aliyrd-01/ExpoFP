<template>
    <div id="root">
        <a href='https://expofp.com/' target="_blank" class='logo-overlay'><img src='expofp-overlay.png' ></a>
        <Overlay />
        <Map />
        <Demo />
        <Debug />
        <div id="fps"></div>
    </div>
</template>

<script lang="ts">
import Overlay from "./Overlay.vue";
import Map from "./Map/Map.vue";
import Debug from "./Debug.vue";
import Demo from "./Demo.vue";

export default Vue.extend({
    // name: 'app',
    components: {
        Overlay,
        Map,
        Debug,
        Demo
    }
});
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
   
    @media screen and (max-width: 500px) {
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
#fps{
    position: fixed;
    top: 10px;
    right: 10px;
    font-size: 10px;
    z-index: 999;
}
</style>
