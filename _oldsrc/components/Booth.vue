<template>
    <OverlayContent v-if="show" back-mode=none @close='$store.dispatch("selectNone")'>
        <template slot="bar">
            <div class="booth__bar">{{title}}</div>
        </template>
        <div class="booth__content -reg" v-if="booth.special === false && !boothExhibitors.length">
            <div v-if='booth.onHold'>On Hold</div>
            <div class="booth__infos">
                <div class="booth__info" v-if='booth.type && !booth.onHold'>
                    <i class="fas fa-cube"></i>
                    <div class="booth__info-title">{{__data.boothTerm}} Type</div>
                    <div class="booth__info-val">{{booth.type}}</div>
                </div>
                <div class="booth__info" v-if='booth.size && !booth.onHold'>
                    <i class="fas fa-expand-alt"></i>
                    <div class="booth__info-title">Size</div>
                    <div class="booth__info-val">{{booth.size}}</div>
                </div>
                <div class="booth__info" v-if='booth.price && !booth.onHold && booth.price !== "0"'>
                    <i class="fas fa-tag"></i>
                    <div class="booth__info-title">Price</div>
                    <div class="booth__info-val">{{booth.price}}</div>
                </div>
            </div>
            <span v-html="instructions" v-if='!booth.onHold'></span>
            <div class="booth__buy" v-if='showBuy'>
                <a :href='booth.buyUrl' rel="noopener">Buy</a>
                <div class="booth__buy-note" v-if="showBuyNote">Secure immediately by <br />credit card
                    payment</div>
            </div>
            <div class="booth__buy" v-if='showReserve'>
                <a :href='booth.reserveUrl || booth.buyUrl' rel="noopener">{{reserveTitle}}</a>
                <div class="booth__buy-note" v-if="showBuyNote">Pay by Invoice <br />30 day payment terms</div>
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
            const b = this.$store.getters.selectedBooth;
            // if (__settings.debug) {
            //     // b.onHold = true;
            //     b.size = "3 x 4 m"
            //     b.price = '$1750';
            // }
            return b;
        },
        showReserve() {
            return !this.booth.onHold && (this.booth.price === '0' || this.booth.reserveUrl);
        },
        showBuy() {
            return !this.booth.onHold && this.booth.buyUrl && this.booth.price !== '0';
        },
        showBuyNote() {
            return EFP_EXPO === 'cbresupplypartner';
        },
        boothExhibitors() {
            return this.booth.exhibitors ? this.booth.exhibitors.map(x => this.exhibitors[x]) : [];
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
        },
        reserveTitle() {
            return EFP_EXPO === 'cbresupplypartner' ? "Reserve & Request Invoice for Payment" : "Reserve";
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

<style lang="scss">
.booth {
    &__bar {
        line-height: 1.5rem;
        color: #333;
        font-weight: 600;
        margin-left: 1rem;
        font-size: 1.1em;
    }
    &__content {
        margin: 0 1rem;
    }
    &__buy-note {
        font-weight: 700;
        font-size: 0.75rem;
        margin-top: 0.2rem;
        color: #555;
    }

    &__title {
        font-weight: 500;
    }

    $im: 0.4rem;
    &__infos {
        /* display: flex;
        margin: 0 -1rem;
        padding: 0 $im;
        background: #fff; */
    }

    &__info {
        /* min-height: 6rem; */
        background: #e1ecf1;
        border-radius: 4px;
        /* flex-grow: 1;
        flex-basis: 1px;
        text-align: center; */
        /* border: solid 1px #aaa; */
        /* margin: 0 $im; */
        padding: 1rem 0;

        display: grid;
        grid-template-columns: 5rem auto;
        align-items: center;
        /* flex-direction: column; */
        /* justify-content: center; */
        margin-bottom: 1rem;

        > i {
            font-size: 2.1rem;
            /* padding-bottom: 0.5rem; */
            color: #71b7d4;
            opacity: 0.7;
            /* grid-column-start: 1; */
            /* grid-column-end: 1; */
            /* grid-row-start: 1; */
            grid-row: 1 / span 2;
            display: flex;
            flex-direction: column;
            align-items: center;
            /* justify-content: center; */
        }
        &-title {
            grid-column: 2;
            font-size: 0.7em;
            font-weight: 600;
            color: #557988;
            text-transform: uppercase;
        }
        &-val {
            grid-column: 2;
            /* grid-column-end: 2; */
            grid-row: 2;
            /* grid-row-end: 2; */

            /* text-transform: uppercase; */
            /* font-weight: 500; */
            font-size: 1rem;
            font-weight: 600;
            /* color: #000; */
            padding: 0 1rem 0 0;
        }
    }

    &__buy {
        text-align: center;
        margin: 2rem 0;

        > a {
            border: none;
            text-decoration: none;
            display: inline-block;
            background: #41b6e7;
            padding: 0.5rem 1rem;
            min-width: 10rem;
            color: #fff !important;
            text-decoration: none !important;
            transition: background-color 200ms;
            border-radius: 2px;
            display: inline-flex;
            align-items: center;
            justify-content: center;

            &:hover {
                background: #2f99c7;
            }
            &:active {
                background: #2285af;
            }

            .overlay.bottom & {
                width: 100%;
                min-height: 3rem;
                font-size: 1.2rem;
            }
        }
    }
}
</style>
