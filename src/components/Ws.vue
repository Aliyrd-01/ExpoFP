<template>
    <transition-group name="ws__list" tag="section" :class="sectionClass" :style="sectionStyle" @mouseover="mouseover"
        @mouseout="mouseout">
        <a :href="`?${e.e.slug}`" v-for="e in adv" :key="e.key" class="ws__exhibitor" :style='{height: `${wsHeightPx}px`}'
            @click.prevent="select(e.e.id)"><img :src='e.e.logo' :alt='e.e.name'></a>
    </transition-group>
</template>

<script lang="ts">
import { mapGetters, mapState } from "vuex";
import { shuffle } from "@/utils";
import { remsToPixels } from '@/components/Map/utils';

const imgByExhibitorId = new Map<number, HTMLImageElement>();
let intervaId: number;

export default {
    data: () => ({ loadedAdv: [], adv: [], index: 0 }),
    computed: {
        ...mapState([
            "overlayWidthRems",
            "screenSize"
        ]),
        ...mapGetters([
            "overlayPosition",
            "wsHeightPx",
            "exhibitorsArray",
        ]),
        all() {
            return shuffle(this.exhibitorsArray.filter(x => x.advertise && x.logo));
        },
        sectionClass() {
            return 'ws ' + this.overlayPosition;
        },
        sectionStyle() {
            const width = this.overlayPosition === "left" ? `calc(100% - ${this.$store.state.overlayWidthRems}rem)` : '100%';
            const opacity = this.adv.length ? 1 : 0;
            // const display = this.adv.length ? 'flex' : 'none';
            // const height = `${this.wsHeightPx}px`;
            return { width, opacity };
        },
    },
    mounted() {
        // this.$watch("loadedAdv", this.setupNext);
        window.setTimeout(() =>
            this.all.forEach(x => {
                const img = new Image();
                img.onload = () => {
                    imgByExhibitorId.set(x.id, img);
                    if (imgByExhibitorId.size === this.all.length) {
                        this.loadedAdv = this.all;
                        this.$watch("screenSize", this.setupNext);
                        this.mouseout();
                        // intervaId = window.setInterval(this.setupNext, 5000);
                        this.setupNext();
                    }
                };
                img.src = x.logo;
            }), 2000);
    },
    methods: {
        setupNext() {
            const rectWidth = (this.$el as HTMLDivElement).getBoundingClientRect().width;
            const maxWidth = rectWidth - remsToPixels(0.3) * 2; // exclude padding
            let filledWidth = 0;
            const adv = [];
            do {
                const e = this.loadedAdv[this.index % this.loadedAdv.length];
                const img = imgByExhibitorId.get(e.id);
                const width = img.width * this.wsHeightPx / img.height + 20; //padding

                if (filledWidth + width > maxWidth) break;

                filledWidth += width;
                adv.push({ key: adv.length, e: e });
                this.index++;

            } while (true)
            this.adv = adv;
        },
        select(id) {
            this.$store.dispatch("clickExhibitor", id);
        },
        mouseover() {
            if (intervaId) {
                window.clearInterval(intervaId);
                intervaId = undefined;
            }
        },
        mouseout() {
            intervaId = window.setInterval(this.setupNext, 10000);
        }
    }
};
</script>
<style lang="scss">
.ws {
    position: fixed;
    top: 0;
    right: 0;
    /* height: 0; */
    background: #fff;
    display: flex;
    justify-content: space-around;
    padding: 0 0.3rem;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
    filter: brightness(97%);
    transition: opacity 0.5s;

    &__exhibitor {
        /* height: 100%; */
        display: flex;
        align-items: center;
        background: #fff;
        margin: 0.3rem 0;

        > img {
            //max-width: 45vw;
            max-height: 100%;
        }
    }
}
.ws__list-item {
    display: inline-block;
    margin-right: 10px;
}
.ws.left .ws__list-enter-active {
    transition: all 0.5s;
}
.ws__list-leave-active {
    display: none;
}
.ws.left .ws__list-enter,
.ws.left .ws__list-leave-to {
    opacity: 0;
    transform: scale(1.1);
}
</style>