<template>
    <section class="ws" :style="style">
        <a :href="`?${e.slug}`" v-for="e in exhibitors" :key="e.slug" class="ws__exhibitor" :style='{height: `${wsHeightPx}px`}'
            @click.prevent="select(e.id)"><img :src='e.logo' :alt='e.name'></a>
    </section>
</template>

<script lang="ts">
import { mapGetters, mapState } from "vuex";


export default {
    data: () => ({}),
    computed: {
        ...mapState([
            "overlayWidthRems",
        ]),
        ...mapGetters([
            "overlayPosition",
            "wsHeightPx",
            "exhibitorsArray",
        ]),
        height() {

        },
        style() {
            const width = this.overlayPosition === "left" ? `calc(100% - ${this.$store.state.overlayWidthRems}rem)` : '100%';
            // const height = `${this.wsHeightPx}px`;
            return { width };
        },
        exhibitors() {
            const adv = this.exhibitorsArray.filter(x => x.advertise);
            return adv;
        }
    },
    methods: {
        select(id) {
            this.$store.dispatch("clickExhibitor", id);
        }
    }

};
</script>
<style lang="scss">
.ws {
    position: fixed;
    top: 0;
    right: 0;
    height: 0;
    /* background: #999; */
    display: flex;
    justify-content: space-between;
    padding: 0 0.3rem;

    &__exhibitor {
        /* height: 100%; */
        display: flex;
        align-items: center;
        background: #fff;
        margin: 0.2rem 0;

        > img {
            //max-width: 45vw;
            max-height: 100%;
        }
    }
}
</style>