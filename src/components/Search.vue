<template>
    <OverlayScrollable v-if="show" @close='handleClose' @back='handleBack' :back-mode='backMode' :hide-close='!text'>
        <template slot="bar">
            <div class="bar">
                <input type="search" :class={fixed:hideRealInput} :placeholder="placeHolder" :value="text" @input="setText" @focus="setText" @blur="setText" />
                <input type="search" v-if="hideRealInput" :placeholder="placeHolder" :value="text" @focus.prevent="handleReplicaFocus" />
            </div>
        </template>
        <ExhibitorsList />
    </OverlayScrollable>
</template>

<script lang="ts">
import { mapGetters, mapState } from "vuex";
import ExhibitorsList from "./ExhibitorsList.vue";
import OverlayScrollable from "./OverlayScrollable.vue";

export default {
    components: { ExhibitorsList, OverlayScrollable },
    data: () => ({
        positionTop: 0,
        placeHolder: "Search company, booth or category"
    }),
    computed: {
        ...mapState(["list", "details"]),
        text() {
            return this.list.text;
        },
        show() {
            return !this.details && this.list.type === "search";
        },
        hideRealInput() {
            return this.positionTop > 50;
        },
        backMode() {
            return this.text ? "back" : "menu";
        }
    },
    methods: {
        setText() {
            this.$store.commit("setList", {
                type: "search",
                text: this.getInput().value,
                focused: document.activeElement === this.getInput()
            });
        },
        handleReplicaFocus() {
            this.getInput().focus();
        },
        handleClose() {
            this.getInput().value = "";
            this.getInput().focus();
        },
        handleBack() {
            this.getInput().value = "";
        },
        getInput() {
            return this.$el.querySelector("input[type=search]");
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
