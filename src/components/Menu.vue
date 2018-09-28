<template>
    <OverlayScrollable v-if="menu" @close='close' @back='close' back-mode='none'>
        <template slot="bar">
            <div class="bar">
                <a class="title" :href="EFP_HOME_URL" target="_blank">
                    <img :src="EFP_LOGO_URL" />
                </a>
            </div>
        </template>
        <div class="block">
            <a :href='EFP_HOME_URL' target="_blank">Expo Home</a>
            <a href='?bookmarks' @click.prevent='close(); $store.dispatch("selectBookmarks")'>My Bookmarks</a>
        </div>
        <div class="block">
            <div class="name">Categories</div>
            <a :href='"?" + encodeURIComponent(c.slug)' v-for="c in categoriesArray" :key="c.id" @click.prevent='close(); $store.dispatch("selectCategory", c.id)'>{{c.name}} ({{numOfExhibitors(c.id)}})</a>
        </div>
    </OverlayScrollable>
</template>

<script lang="ts">
import { mapGetters, mapState } from "vuex";
import OverlayScrollable from "./OverlayScrollable.vue";

export default {
    components: { OverlayScrollable },
    data: () => ({
        EFP_HOME_URL,
        EFP_LOGO_URL
    }),
    computed: {
        ...mapState(["menu"]),
        ...mapGetters(["categoriesArray"]),
        show() {
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
.title {
    display: block;
    padding: 2rem 1rem;
    font-size: 2rem;
    font-weight: 100;
    background: #eee;
    text-align: center;
    margin-right: -3rem;
    img {
        width: 160px;
    }
}
.bar {
    /* margin-left: 1rem; */
    font-size: 1.1em;
    font-weight: 500;
    color: #333;
    > span {
        color: #aaa;
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
