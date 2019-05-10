<template>
    <OverlayContent v-if="show" @close='handleClose' @back='handleBack' :back-mode='backMode' :hide-close='!showClose'>
        <template slot="bar">
            <div class="search__bar">
                <input type="search" :class={fixed:hideRealInput} :placeholder="placeHolder" :value="text" @input="setText"
                    @keydown="handleKeydown" @focus="handleFocus" @blur="handleBlur" />
                <input type="search" v-if="hideRealInput" :placeholder="placeHolder" :value="text" @focus.prevent="handleReplicaFocus" />
            </div>
        </template>
        <List />
    </OverlayContent>
</template>

<script lang="ts">
import { mapGetters, mapState } from "vuex";
import List from "./List.vue";
import OverlayContent from "./OverlayContent.vue";

export default {
    components: { OverlayContent, List },
    data: () => ({
        hideRealInput: true,
        placeHolder: `Search company, ${__data.boothTerm} or category`
    }),
    computed: {
        ...mapState(["list", "details", "menu", "overlaySize", "searchFocused"]),
        ...mapGetters(["overlayPosition"]),
        text() {
            return this.list.text;
        },
        show() {
            return !this.details && !this.menu && this.list.type === "search";
        },
        bottomFull() {
            return this.overlaySize === "full" && this.overlayPosition === "bottom";
        },
        showClose() {
            return !!this.text; // || this.bottomFull
        },
        backMode() {
            return this.text ? "back" : "menu";
        }
    },
    mounted() {
        const setPosition = () => {
            if (!this.$el.tagName) return;
            const newVal = this.$el.getBoundingClientRect().top > 50;
            this.hideRealInput = newVal || this.overlaySize !== "full";
        };
        setPosition();
        window.setInterval(setPosition, 50);
    },
    watch: {
        overlaySize: function (s) {
            if (s !== "full" && document.activeElement === this.getInput()) {
                this.getInput().blur();
            }
        },
        searchFocused: function (f) {
            const i = this.getInput();
            if (i && f && document.activeElement !== i) {
                i.focus();
            }
        }
    },
    methods: {
        setText() {
            const text = this.getInput().value;
            this.$store.commit('setCenterMap', true);
            this.$store.commit('setActiveListIndex', text ? 0 : -1);

            this.$store.commit("setList", {
                type: "search",
                text,
                focused: document.activeElement === this.getInput()
            });
        },
        handleKeydown(e) {
            // __logger.log('handleKeydown', e);
            let delta = 0;
            switch (e.key) {
                case "Down":
                case "ArrowDown":
                    delta = 1;
                    break;
                case "Up":
                case "ArrowUp":
                    delta = -1;
                    break;
                case "Enter":
                    e.preventDefault();
                    this.$store.dispatch("openActiveListItem");    
                    return;
            }
            if (delta) {
                e.preventDefault();
                this.$store.dispatch("changeActiveListIndex", delta);
            }
        },
        handleReplicaFocus() {
            this.getInput().focus();
        },
        handleClose() {
            // if (this.bottomFull) {
            //     this.handleBack();
            //     store.commit("setOverlaySize", "medium");
            // } else {
            //     this.getInput().value = "";
            //     this.getInput().focus();
            //     this.setText();
            // }
            this.getInput().value = "";
            this.getInput().focus();
            this.setText();
        },
        handleBack() {
            this.getInput().value = "";
            this.setText();
            store.commit("setOverlaySize", "medium");
        },
        handleBlur() {
            this.$store.commit("setSearchFocused", false);
        },
        handleFocus() {
            this.$store.commit("setSearchFocused", true);
        },
        getInput() {
            return this.$el.querySelector ? this.$el.querySelector("input[type=search]") : null;
        }
    }
};
</script>

<style lang="scss">
.search {
    &__bar {
        input {
            border: none;
            border-radius: 0.5rem;
            outline: none;
            height: $overlay-height;
            -webkit-appearance: none;
            -webkit-tap-highlight-color: transparent;
            width: 100%;
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
    }
}
</style>
