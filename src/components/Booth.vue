<template>
    <OverlayContent v-if="show" back-mode=none @close='$store.dispatch("selectNone")'>
        <template slot="bar">
            <div class="bar">Booth {{booth.name}}</div>
        </template>
        <div class="booth" v-if="!boothExhibitors.length">
            <div class="info" v-if='booth.isOnHold'>On Hold</div>
            <div class="info" v-if='booth.boothTypeName && !booth.isOnHold'>Booth Type: {{booth.boothTypeName}}<br/><br/></div>
            <div class="info" v-if='booth.size && !booth.isOnHold'>{{booth.size}}</div>
            <div class="info" v-if='booth.price && !booth.isOnHold'>{{booth.price}}</div>
            <span v-html="instructions" v-if='!booth.isOnHold'></span>
            <div class="buy" v-if='booth.buyUrl && !booth.isOnHold'>
                <a :href='booth.buyUrl' target='_blank'>Buy</a>
            </div>
        </div>
        <ExhibitorRow v-for="item in boothExhibitors" :key="item.id" :exhibitor='item' />
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
        instructions(){
            return __data.reserveInstructions;
        }, 
        booth() {
            return this.$store.getters.selectedBooth;
        },
        boothExhibitors() {
            return this.booth.exhibitors.map(x => this.exhibitors[x]);
        },
        show() {
            return !this.menu && this.details && this.details.type === "booth";
        },
        buyUrl() {

        }
    },
    methods: {
        buy() {
            alert("This functionality is disabled in the demo version");
        }
    }
};
</script>

<style scoped lang="scss">
.booth {
    margin: 0 1rem;
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
