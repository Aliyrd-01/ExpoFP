<template>
    <section class="ws" :style="sectionStyle">
        <a :href="`?${e.slug}`" v-for="e in adv" :key="e.slug" class="ws__exhibitor" :style='{height: `${wsHeightPx}px`}'
            @click.prevent="select(e.id)"><img :src='e.logo' :alt='e.name'></a>
    </section>
</template>

<script lang="ts">
import { mapGetters, mapState } from "vuex";
import { shuffle } from "@/utils";
import { remsToPixels } from '@/components/Map/utils';

const imgByExhibitorId = new Map<number, HTMLImageElement>();

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
        // height() {

        // },
        // adv() {
        //     const i = this.groupIndex % this.groups.length;
        //     return this.groups[i];
        // },
        sectionStyle() {
            const width = this.overlayPosition === "left" ? `calc(100% - ${this.$store.state.overlayWidthRems}rem)` : '100%';
            // const display = this.adv.length ? 'flex' : 'none';
            // const height = `${this.wsHeightPx}px`;
            return { width };
        },
    },
    mounted() {
        this.$watch("sectionStyle", this.setupNext);
        this.$watch("loadedAdv", this.setupNext);
        this.load();
        window.setInterval(this.setupNext, 5000);
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
                const width = img.width * this.wsHeightPx / img.height;

                if (filledWidth + width > maxWidth) break;

                filledWidth += width;
                adv.push(e);
                this.index++;

            } while (true)
            this.adv = adv;
            //for(let i = this.index; i)
            //this.groupIndex++;
        },
        load(cb: () => void) {
            // split into groups
            const all: Exhibitor[] = shuffle(this.exhibitorsArray.filter(x => x.advertise));
            // const groups: Exhibitor[][] = [];
            // let currentGroup: Exhibitor[];
            // let currentGroupWidth: number;
            // const rectWidth = (this.$el as HTMLDivElement).getBoundingClientRect().width;
            // const maxWidth = rectWidth - remsToPixels(0.3) * 2; // exclude padding
            // const minSpaceBetween = remsToPixels(0.5);
            // let loaded = 0;
            // const loadingImages = [];

            all.forEach(x => {
                const img = new Image();
                // loadingImages.push(img);
                img.onload = () => {
                    // const width = img.width * this.wsHeightPx / img.height;
                    // loaded++;
                    // if (!currentGroup || currentGroup.length > 0 && currentGroupWidth + width > maxWidth) {
                    //     currentGroup = [];
                    //     currentGroupWidth = 0;
                    //     groups.push(currentGroup);
                    // }
                    // currentGroupWidth += width;
                    // currentGroup.push(x);
                    // console.log('currentGroupWidth', width, currentGroupWidth, maxWidth)
                    imgByExhibitorId.set(x.id, img);
                    if (imgByExhibitorId.size === all.length) this.loadedAdv = all;
                };
                img.src = x.logo;
            })
        },
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
    /* height: 0; */
    background: #fff;
    display: flex;
    justify-content: space-around;
    padding: 0 0.3rem;
    box-shadow: 0 0 25px rgba(0, 0, 0, 0.1);
    filter: brightness(96%);
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