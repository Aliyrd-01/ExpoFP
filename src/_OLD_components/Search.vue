<template>
    <OverlayScrollable v-if="show" @close='handleClose' @back='handleBack' :back-mode='backMode'>
        <template slot="bar">
            <div class="bar">
                <input type="search" :class={fixed:hideRealInput} :placeholder="placeHolder" :value="searchText" @input="setSearchText" @focus="handleFocus" @blur="handleBlur" />
                <input type="search" v-if="hideRealInput" :placeholder="placeHolder" :value="searchText" @focus.prevent="handleReplicaFocus" />
            </div>
        </template>
        <ExhibitorRow v-for="item in filteredExhibitors" :key="item.id" :exhibitor='item' />
    </OverlayScrollable>
</template>

<script lang="ts">
import { mapGetters, mapState } from "vuex";
import ExhibitorRow from "./ExhibitorRow.vue";
import OverlayScrollable from "./OverlayScrollable.vue";

export default {
    components: { ExhibitorRow, OverlayScrollable },
    data: () => ({
        positionTop: 0,
        placeHolder: "Search company, booth or category"
    }),
    mounted() {
        // console.log('mounted', this.$el)
        // this.input = this.$el.querySelector("input[type=search]");
    },
    computed: {
        ...mapState(["searchText", "searchFocused", "overlaySize"]),
        ...mapGetters(["filteredExhibitors"]),
        show() {
            return !this.$store.state.details;
        },
        hideRealInput() {
            return this.positionTop > 50;
        },
        backMode(){
            return this.searchText ? 'back' : 'menu';
        }
    },
    methods: {
        setSearchText(e) {
            this.$store.commit("setSearchText", e.target.value);
        },
        handleBlur() {
            this.$store.commit("setSearchFocused", false);
        },
        handleFocus() {
            this.$store.commit("setSearchFocused", true);
        },
        handleReplicaFocus() {
            this.focusInput();
        },
        handleClose() {
            this.$store.dispatch("selectText", "");
            this.focusInput();
        },
        handleBack(){
             this.$store.dispatch("selectText", "");
        },
        focusInput(){
            this.$el.querySelector("input[type=search]").focus();
        }
    }
};
</script>

<style scoped lang="scss">
input {
    border: none;
    border-radius: 0.5rem;
    outline: none;
    height: var(--size);
    -webkit-appearance: none;
    flex-grow: 1;
}
input::placeholder {
    color: #bbb;
}

input.fixed {
    opacity: 0;
    pointer-events: none;
    position: fixed;
    top: -100px;
}
</style>
