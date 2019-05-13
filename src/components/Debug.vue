<template>
    <div class='debug' v-if="enabled">
        <!-- <label>Override SVG:</label> -->

        <!-- <textarea v-model="overrideSvg">
        </textarea> -->
        <br />
        <button @click="save">Save &amp; Reload</button>
        &nbsp;
        <a href='' @click.prevent="cancel">Cancel</a>
        <div>
            <label>Canvases ({{debugCanvases.length}}):</label>
            <div :key=item.toDataURL() v-for="item in debugCanvases" style="display: inline-block; padding: 2px; vertical-align: top">
                {{item.width}}x{{item.height}}={{item.width*item.height}}
                <br />
                <img :src='item.toDataURL()' style="background: #aaa" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { mapState } from "vuex";

export default {
    data: () => ({
        //overrideSvg: localStorage.getItem("overrideSvg") || ""
        // enabled: false
    }),
    computed: {
        ...mapState(["list"]),
        enabled() {
            return this.list && this.list.type === "search" && this.list.text === "q1";
        },
        debugCanvases() {
            return debugCanvases;
        }
    },
    methods: {
        save() {
            // localStorage.setItem("overrideSvg", this.overrideSvg);
            throw new Error('Test error');
            location.replace("/");
        },
        cancel() {
            this.$store.dispatch("selectSearch", "");
        }
    }
};

// export const debuggedCanvases:HTMLCanvasElement[] = [];

</script>
<style scoped lang="scss">
.debug {
    position: fixed;
    z-index: 999;
    background: #fff;
    width: calc(100vw - 2rem);
    height: calc(100vh - 2rem);
    top: 1rem;
    left: 1vw;
    padding: 1rem;
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
    overflow: scroll;
    label {
        display: block;
        font-weight: 500;
    }
    /* textarea {
        width: 100%;
        display: block;
        min-height: 20%;
        font-size: 12px;
        font-family: monospace;
        background: #eee;
    } */
}
</style>