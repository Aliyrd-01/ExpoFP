<template>
    <div id="root">
        <Overlay/>
        <Map/>
        <Debug/>
        <Menu/>
    </div>
</template>

<script lang="ts">
import Menu from "./Menu.vue";
import Overlay from "./Overlay.vue";
import Map from "./Map/Map.vue";
import Debug from "./Debug.vue";

export default Vue.extend({
    // name: 'app',
    components: {
        Overlay,
        Map,
        Debug,
        Menu
    }
});
</script>

<style lang="scss">
:root {
    --error-color: red;
    --color: #34a1e6;
    --color-light: #44aef1;
    --color-dark: #337caa;
    --link-color: #007aff;
    --link-color-hover: #ff0028;
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
    color:#13a1de;
    text-decoration: none;
}
a:hover, a:visited{
    color: #13a1de;
    text-decoration: underline;
}
</style>
