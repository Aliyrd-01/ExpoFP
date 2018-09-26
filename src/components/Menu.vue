<template>
    <div :class="{container:1, visible: visible}">
        <div class="bg" @click="close"></div>
        <div class="menu">
            <a class="title" :href="EFP_HOME_URL" target="_blank">
                <img :src="EFP_LOGO_URL" />
            </a>
            <div class="menu-scrollable">
                <div class="block">
                    <a :href='EFP_HOME_URL' target="_blank">Expo Home</a>
                    <a href='?bookmarks' @click.prevent='close();$store.dispatch("selectBookmarks")'>My Bookmarks</a>
                </div>
                <div class="block">
                    <div class="name">Categories</div>
                    <a :href='"?" + encodeURIComponent(c.name)' v-for="c in categoriesArray" :key="c.id" @click.prevent="selectText(c.name)">{{c.name}} ({{numOfExhibitors(c.id)}})</a>
                </div>
            </div>
        </div>
    </div>

</template>

<script lang="ts">
import { mapGetters, mapState } from "vuex";
import s from "@/settings";
//import ListRow from "./ListRow";

export default {
    name: "Menu",
    data: () => ({
        EFP_HOME_URL,
        EFP_LOGO_URL
    }),
    computed: {
        ...mapGetters(["categoriesArray"]),
        visible() {
            return this.$store.state.menu;
        }
    },
    methods: {
        close() {
            this.$store.commit("setMenu", false);
        },
        selectText(name) {
            this.$store.dispatch("selectText", name);
            this.close();
        },
        numOfExhibitors(id) {
            return this.$store.getters.exhibitorsArray.filter(e => e.categories.indexOf(id) !== -1).length;
        }
    }
};
</script>

<style scoped lang="scss">
.container {
    z-index: 10;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 200ms;
    margin-left: -100%;
    &.visible {
        margin-left: 0;
        opacity: 1;
        > .menu {
            margin-left: 0;
        }
    }

    .menu-scrollable {
        overflow-y: auto;
    }

    > .bg {
        background: rgba(0, 0, 0, 0.5);
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        position: absolute;
    }

    > .menu {
        width: 20rem;
        max-width: 80vw;
        background: #fff;
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        margin-left: -100%;
        transition: margin-left 300ms ease;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
    }
}

.title {
    display: block;
    padding: 2rem 1rem;
    font-size: 2rem;
    font-weight: 100;
    background: #eee;
    text-align: center;
    img {
        width: 160px;
    }
}
.block {
    border-top: solid 1px #eee;
    padding: 0.5rem 0;
    > .name {
        padding: 0.5rem 1rem;
        color: #aaa;
        font-size: 0.9rem;
    }
    > a {
        display: block;
        padding: 0.6rem 1rem;
        text-decoration: none !important;
        color: #333 !important;
        &:hover {
            background: #eee;
        }
    }
}
</style>
