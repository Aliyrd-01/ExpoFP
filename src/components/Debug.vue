<template>
    <div class='debug' v-if="enabled">
        <label>Override SVG:</label>

        <textarea v-model="overrideSvg">
        </textarea>
        <br/>
        <button @click="save">Save &amp; Reload</button>
        &nbsp;
        <a href='' @click.prevent="cancel">Cancel</a>
    </div>
</template>

<script lang="ts">
import { mapState } from "vuex";

export default {
    data: () => ({
        overrideSvg: localStorage.getItem("overrideSvg") || ""
        // enabled: false
    }),
    computed: {
        ...mapState(["searchText"]),
        enabled() {
            return this.searchText === "debug1";
        }
    },
    methods: {
        save() {
            localStorage.setItem("overrideSvg", this.overrideSvg);
            location.replace("/");
        },
        cancel() {
            this.$store.commit("setSearchText", "");
        }
    }
};
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
    label {
        display: block;
        font-weight: 500;
    }
    textarea {
        width: 100%;
        display: block;
        min-height: 80%;
        font-size: 12px;
        font-family: monospace;
        background: #eee;
    }
}
</style>