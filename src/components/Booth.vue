<template>
    <OverlayContent v-if="show" back-mode=none @close='$store.dispatch("selectNone")'>
        <template slot="bar">
            <div class="bar">{{title}}</div>
        </template>
        <div class="booth__content -reg" v-if="booth.special === false && !boothExhibitors.length">
            <div class="info" v-if='booth.onHold'>On Hold</div>
            <div class="info" v-if='booth.type && !booth.onHold'>{{__data.boothTerm}} Type: {{booth.type}}<br /><br /></div>
            <div class="info" v-if='booth.size && !booth.onHold'>{{booth.size}}</div>
            <div class="info" v-if='booth.price && !booth.onHold && !reserve'>{{booth.price}}</div>
            <span v-html="instructions" v-if='!booth.onHold'></span>
            <div class="buy" v-if='booth.buyUrl && !booth.onHold'>
                <a :href='booth.buyUrl' target='_blank'>{{reserve ? 'Reserve' : 'Buy'}}</a>
            </div>
        </div>
        <div class="booth__content -spec" v-if="booth.special === true">
            <div class="booth__desc" v-if='booth.description' v-html="booth.description"></div>
        </div>
        <ExhibitorRow v-for="item in boothExhibitors" :key="item.id" :exhibitor='item' class="list-row" />
    </OverlayContent>
</template>

<script lang="ts">
import { mapState, mapGetters } from "vuex";
import OverlayContent from "./OverlayContent.vue";
import ExhibitorRow from "./ExhibitorRow.vue";

export default {
    components: { OverlayContent, ExhibitorRow },
    computed: {
        ...mapState(["exhibitors", "menu", "details"]),
        instructions() {
            return __data.reserveInstructions;
        },
        booth() {
            return this.$store.getters.selectedBooth;
        },
        reserve(){
            return this.booth.price === '0';
        },
        boothExhibitors() {
            return this.booth.exhibitors ? this.booth.exhibitors.map(x => this.exhibitors[x]): [];
        },
        show() {
            return !this.menu && this.details && this.details.type === "booth";
        },
        title() {
            const b = this.booth as Booth;
            if (b.special === true) {
                return b.title || b.name;
            } else if (b.special === false) {
                return __data.boothTerm + ' ' + b.name;
            }
        }
        // buyUrl() {

        // }
    },
    methods: {
        // buy() {
        //     alert("This functionality is disabled in the demo version");
        // }
    }
};
</script>

<style scoped lang="scss">
.booth {
    &__content {
        margin: 0 1rem;
    }
}
.title {
    font-weight: 500;
}
.buy {
    text-align: center;
    margin: 2rem 0;
}
.buy > a {
    border: none;
    text-decoration: none;
    display: inline-block;
    background: #41b6e7;
    padding: 0.5rem 1rem;
    min-width: 10rem;
    color: #fff;
    transition: background-color 200ms;
    border-radius: 2px;
    &:hover {
        background: #2f99c7;
    }
    &:active {
        background: #2285af;
    }
}
.bar {
    line-height: 1.5rem;
    color: #333;
    font-weight: 500;
    margin-left: 1rem;
    font-size: 1.1em;
}
</style>
