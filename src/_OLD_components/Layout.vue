<template>
    <div id="root">
        <img src='expofp-overlay.png' class='logo-overlay'>
        <Overlay/>
        <Map/>
        <Demo/>
        <Debug/>
        <Menu/>
    </div>
</template>

<script lang="ts">
import Menu from "./Menu.vue";
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
        Menu,
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
}
html,
body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    font-size: 15px;
}
#root {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #ccc;
    overflow: hidden;
    // font-size: 15px;
}
a {
    color: var(--link-color);
    text-decoration: none;
}
a:hover,
a:visited {
    color: var(--link-color-hover);
    text-decoration: underline;
}

.logo-overlay {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    width: 5rem;
    pointer-events: none;
    @media screen and (max-width: 500px) {
        top: 0.5rem;
        right: 0.5rem;
        bottom: unset;
        width: 3rem;
    }
}
</style>
