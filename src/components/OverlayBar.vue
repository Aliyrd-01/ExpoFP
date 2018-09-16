<template>
    <div class="bar">
        <OverlayBarBack :mode='showBack ? "back": "menu"' :enable-animation="true" @click="handleLeftIconClick" />
        <input type="search" ref="input" v-if="!detailsTitle" :class={fixed:hideRealInput} :placeholder="placeHolder" :value="searchText" @input="setSearchText" @focus="handleFocus" @blur="handleBlur" />
        <input type="search" ref="inputReplica" v-if="!detailsTitle && hideRealInput" :placeholder="placeHolder" :value="searchText" @focus.prevent="handleReplicaFocus" />
        <div class='title' v-if="detailsTitle">{{detailsTitle}}</div>
        <a class="fal fa-times" href='/' v-if="showClose" @click.prevent="handleCloseClick"></a>
    </div>

</template>

<script lang="ts">
import OverlayBarBack from "./OverlayBarBack.vue";
import { mapState, mapGetters } from "vuex";

export default {
    name: "OverlayBar",
    components: {
        OverlayBarBack
    },
    data: () => ({
        positionTop: 0,
        placeHolder: "Search company, booth or category"
    }),
    computed: {
        ...mapState(["searchText", "searchFocused", "overlaySize"]),
        ...mapGetters(["selectedBooth", "selectedExhibitor", "overlayPosition"]),
        detailsTitle() {
            if (this.selectedExhibitor) return this.selectedExhibitor.name;
            if (this.selectedBooth) return this.selectedBooth.name;
            return null;
        },
        showClose() {
            return !!(this.searchText || this.detailsTitle);
        },
        showBack() {
            return this.showClose || (this.overlayPosition !== "left" && this.overlaySize === "full");
        },
        hideRealInput() {
            return this.positionTop > 50;
        }
    },
    watch: {
        searchFocused: function(focused) {
            if (focused && this.overlayPosition !== "left") {
                this.$store.commit("setOverlaySize", "full");
            }
        },
        overlaySize: function(size) {
            if (this.searchFocused && size !== "full") this.$refs.input.blur();
        }
    },
    mounted() {
        const setPosition = () => {
            this.positionTop = this.$el.getBoundingClientRect().top;
        };
        setPosition();
        window.setInterval(setPosition, 50);
    },
    methods: {
        setSearchText(e) {
            this.$store.commit("setSearchText", e.target.value);
        },
        handleLeftIconClick() {
            if (this.detailsTitle) {
                this.$store.dispatch("selectNone");
            } else if (this.showBack) {
                this.$store.dispatch("selectText", "");
                if (this.overlayPosition === "bottomLeft") {
                    this.$store.commit("setOverlaySize", "small");
                } else if (this.overlayPosition === "bottom") {
                    this.$store.commit("setOverlaySize", "medium");
                }
            } else {
                this.$store.commit("setMenu", true);
            }
        },
        handleCloseClick() {
            if (this.detailsTitle) {
                // go back
                this.$store.dispatch("selectNone");
            } else {
                this.$store.dispatch("selectText", "");
                this.$refs.input.focus();
            }
        },
        handleBlur() {
            this.$store.commit("setSearchFocused", false);
        },
        handleFocus() {
            this.$store.commit("setSearchFocused", true);
        },
        handleReplicaFocus(){
            this.$refs.input.focus();
        }
    }
};
</script>

<style

<style scoped>
.bar {
    border-bottom: solid 1px #eee;
    display: flex;
    align-items: center;
    --size: 3.5rem;
    background: #fff;
}

.bar >>> .fal {
    height: var(--size);
    min-width: var(--iconWidth);
    line-height: var(--size);
    text-align: center;
    font-size: 1.3rem;
    text-decoration: none;
    color: #999999;
}

input {
    border: none;
    border-radius: 0.5rem;
    outline: none;
    height: var(--size);
    -webkit-appearance: none;
    flex-grow: 1;
}

input.fixed {
    opacity: 0;
    pointer-events: none;
    position: fixed;
    top: -100px;
}

.title {
    flex-grow: 1;
    line-height: 1.5rem;
    color: #4688c5;
    font-weight: 500;
}
</style>
