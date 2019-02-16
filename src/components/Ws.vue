<template>
    <section class="ws" :style="style">
        <a :href="`?${e.slug}`" v-for="e in adv" :key="e.slug" class="ws__exhibitor" 
        :style='{height: `${wsHeightPx}px`}'
            @click.prevent="select(e.id)"><img :src='e.logo' :alt='e.name'></a>
    </section>
</template>

<script lang="ts">
import { mapGetters, mapState } from "vuex";
import { shuffle } from "@/utils";
import { remsToPixels } from '@/components/Map/utils';


export default {
    data: () => ({ groups: [], groupIndex: 0 }),
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
        height() {

        },
        adv() {
            const i = this.groupIndex % this.groups.length;
            return this.groups[i];
        },
        style() {
            const width = this.overlayPosition === "left" ? `calc(100% - ${this.$store.state.overlayWidthRems}rem)` : '100%';
            // const display = this.adv.length ? 'flex' : 'none';
            // const height = `${this.wsHeightPx}px`;
            return { width };
        },
    },
    mounted() {
        this.$watch("screenSize", this.calcGroups);
        this.$watch("groups", this.setupNextGroup);
        this.calcGroups();
        window.setInterval(this.setupNextGroup, 1000);
    },
    methods: {
        setupNextGroup() {
            this.groupIndex++;
        },
        calcGroups() {
            // split into groups
            const all: Exhibitor[] = shuffle(this.exhibitorsArray.filter(x => x.advertise));
            const groups: Exhibitor[][] = [];
            let currentGroup: Exhibitor[];
            let currentGroupWidth: number;
            const rectWidth = (this.$el as HTMLDivElement).getBoundingClientRect().width;
            const maxWidth = rectWidth - remsToPixels(0.3) * 2; // exclude padding
            const minSpaceBetween = remsToPixels(0.5);
            let loaded = 0;
            const loadingImages = [];

            all.forEach(x => {
                const img = new Image();
                loadingImages.push(img);
                img.onload = () => {
                    const width = img.width * this.wsHeightPx / img.height;
                    loaded++;
                    if (!currentGroup || currentGroup.length > 0 && currentGroupWidth + width > maxWidth) {
                        currentGroup = [];
                        currentGroupWidth = 0;
                        groups.push(currentGroup);
                    }
                    currentGroupWidth += width;
                    currentGroup.push(x);
                    // console.log('currentGroupWidth', width, currentGroupWidth, maxWidth)
                    if (loaded === all.length) this.groups = groups;
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
    height: 0;
    /* background: #999; */
    display: flex;
    justify-content: space-around;
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