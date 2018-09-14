<template>
    <div id="root">
        <div class="demo" v-if="demo">
            <section>
                This is a demo of
                <a href='https://expofp.com/'>ExpoFP</a>
                floor plan. This is not an official in-cosmetics expo plan.
            </section>
        </div>
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
    },
    computed: {
        demo: () => EFP_EXPO === "demo"
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
    color: #13a1de;
    text-decoration: none;
}
a:hover,
a:visited {
    color: #13a1de;
    text-decoration: underline;
}
.demo {
    position: fixed;
    width: 100%;
    display: flex;
    justify-content: center;
    background: #eee;

    > section {
        font-size: 0.8rem;
        user-select: none;
        padding: 0.2rem 0.5rem;
        > a {
            font-weight: 500;
            color: #1378d5;
        }
    }
}
</style>
