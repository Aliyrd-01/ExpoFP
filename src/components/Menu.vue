<template>
    <OverlayContent v-if="show" @close='close' @back='close' back-mode='none' class="menu" :class='{shown}'>
        <template slot="bar">
            <div class="menu__bar">
                <a class="menu__title" :href="EFP_HOME_URL" target="_blank">
                    <img :src="EFP_LOGO_URL" />
                </a>
            </div>
        </template>
        <div class="menu__content">
            <a :href='EFP_HOME_URL' target="_blank" class="menu__item"><i class="fas fa-home"></i> Expo Home&nbsp;<i class="fas fa-external-link"></i></a>
            <a href='?bookmarks' @click.prevent='$store.dispatch("clickBookmarks"); $store.dispatch("moveToList");' class="menu__item"><i class="fas fa-bookmark"></i> My Bookmarks ({{bookmarkedArray.length}})</a>
            <a href='?seminars' @click.prevent='$store.dispatch("clickSeminars");' class="menu__item"><i class="fas fa-graduation-cap"></i> Seminars</a>
            <a href='' @click.prevent='handleSearch' class="menu__item"><i class="fas fa-search"></i> Search</a>
            <div class="menu__item">Categories</div>
            <a class="menu__cat" :href='"?" + encodeURIComponent(c.slug)' v-for="c in categoriesArray" :key="c.id" @click.prevent='$store.dispatch("clickCategory", c.id);'>
                <div class="menu__cat-bullet">&bullet;</div>
                <div class="menu__cat-title">{{c.name}}</div>
                <div class="menu__cat-count">{{numOfExhibitors(c.id)}}</div>
            </a>
        </div>
    </OverlayContent>
</template>

<script lang="ts">
import { mapGetters, mapState } from "vuex";
import OverlayContent from "./OverlayContent.vue";

window.setTimeout(function() {
    const img = new Image();
    img.src = EFP_LOGO_URL;
}, 1000);

export default {
    components: { OverlayContent },
    data: () => ({
        EFP_HOME_URL,
        EFP_LOGO_URL,
        shown: false
    }),
    computed: {
        ...mapState(["menu"]),
        ...mapGetters(["categoriesArray", "bookmarkedArray"]),
        show() {
            return this.menu;
        }
    },
    watch: {
        show(s) {
            if (s) {
                Vue.nextTick(() => {
                    this.shown = true;
                });
            } else this.shown = false;
        }
    },

    methods: {
        close() {
            this.$store.commit("setMenu", false);
        },
        // selectText(name) {
        //     this.$store.dispatch("selectText", name);
        //     this.close();
        // },
        numOfExhibitors(id) {
            return this.$store.getters.exhibitorsArray.filter(e => e.categories.indexOf(id) !== -1).length;
        },
        handleSearch() {
            this.close();
            this.$store.dispatch("selectSearch");
            this.$nextTick(() => this.$store.commit("setSearchFocused", true));
        }
    }
};
</script>

<style lang="scss">
.menu.shown .menu__title > img {
    opacity: 1;
}
.menu {
    background: #f1f1f1;
    &__title {
        display: block;
        padding: 2rem 1rem;
        font-size: 2rem;
        font-weight: 100;
        background: #fff;
        text-align: center;
        margin-right: -3rem;
        img {
            width: 160px;
            opacity: 0;
            transition: opacity 500ms;
        }
    }
    &__item {
        padding: 0.5rem 1rem;
        min-height: 3rem;
        display: block;
        font-weight: 700;
        display: flex;
        align-items: center;
        color: #555 !important;
        text-decoration: none !important;

        > i:nth-child(2) {
            font-size: 0.7em;
            color: #aaa;
        }

        > i:first-child {
            color: #999;
            min-width: 1.7rem;
            text-align: center;
            padding-right: 0.5rem;
        }
    }

    &__content {
        a:hover {
            background: rgba(0, 0, 0, 0.05);
        }
    }

    &__cat {
        padding: 0.5rem 1rem;
        min-height: 2.5rem;
        display: flex;
        justify-content: space-between;
        /* align-items: center; */
        color: #444 !important;
        text-decoration: none !important;
        /* border-bottom: solid 1px #ddd; */
    }

    &__cat-bullet {
        width: 0.7rem;
        color: #aaa;
    }
    &__cat-title {
        /* border-bottom: dotted 1px #ccc; */
        flex-grow: 1;
        /* padding-left: 0.5rem; */
    }
    &__cat-count {
        color: #888;
        font-size: 0.9em;
        /* border-bottom: dotted 1px #ccc */
        /* font-weight: 500; */
    }
}
div.menu__item {
    border-top: solid 1px #ddd;
    padding-bottom: 0;
}
</style>
