<template>
    <OverlayContent v-if="show" @close='handleClose' @back='handleBack' :back-mode='backMode' :hide-close='!text'>
        <template slot="bar">
            <div class="search__bar">
                <input type="search" :class={fixed:hideRealInput} :placeholder="placeHolder" :value="text" @input="setText" @focus="handleFocus" @blur="handleBlur" />
                <input type="search" v-if="hideRealInput" :placeholder="placeHolder" :value="text" @focus.prevent="handleReplicaFocus" />
            </div>
        </template>
        <ExhibitorsList />
    </OverlayContent>
</template>

<script lang="ts">
import { mapGetters, mapState } from "vuex";
import ExhibitorsList from "./ExhibitorsList.vue";
import OverlayContent from "./OverlayContent.vue";

export default {
    components: { ExhibitorsList, OverlayContent },
    data: () => ({
        positionTop: 0,
        placeHolder: "Search company, booth or category"
    }),
    computed: {
        ...mapState(["list", "details", "menu"]),
        text() {
            return this.list.text;
        },
        show() {
            return !this.details && !this.menu && this.list.type === "search";
        },
        hideRealInput() {
            return this.positionTop > 50;
        },
        backMode() {
            return this.text ? "back" : "menu";
        }
    },
    mounted() {
        const setPosition = () => {
            const newPos = this.$el.getBoundingClientRect().top;
            if (newPos !== this.positionTop) this.positionTop = newPos;
        };
        setPosition();
        window.setInterval(setPosition, 50);
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
            this.setText();
        },
        handleBack() {
            this.getInput().value = "";
            this.setText();
        },
        handleBlur() {
            this.$store.commit("setSearchFocused", false);
        },
        handleFocus() {
            this.$store.commit("setSearchFocused", true);
        },
        getInput() {
            return this.$el.querySelector("input[type=search]");
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
