<template>
    <SimpleRow :slug="booth.slug" @click="click" :line1="`${booth.name}`" line2='Booth' @mouseover='mouseover'
        @mouseout='mouseout' />
</template>

<script lang="ts">

import SimpleRow from "./SimpleRow.vue";

export default {
    name: "CategoryRow",
    components: { SimpleRow },
    props: ["booth"],
    methods: {
        click() {
            this.$store.commit("setHoveredBooth", null);
            this.$store.dispatch("clickBoothInList", this.booth.id);
        },
        mouseover() {
            if (this.$store.state.hoveredBooth !== this.booth.id) {
                this.$store.commit("setHoveredBooth", this.booth.id);
            }
        },
        mouseout() {
            this.$store.commit("setHoveredBooth", null);
        }
    }
};
</script>

<style lang="scss">
</style>
