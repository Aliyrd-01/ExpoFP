<template>
    <OverlayContent v-if="show" @close='close' @back='close' back-mode='none' class="menu" :class='{shown}'>
        <template slot="bar">
            <div class="menu__bar">
                <a class="menu__title" :href="homeUrl" target="_blank">
                    <img :src="logoUrl" onerror="this.style.visibility='hidden'" />
                </a>
            </div>
        </template>
        <div class="menu__content">
            <a :href='homeUrl' target="_blank" class="menu__item"><i class="fas fa-home"></i> Event&nbsp;Home&nbsp;<i
                    class="fas fa-external-link"></i></a>
            <a href='' @click.prevent='handleSearch' class="menu__item"><i class="fas fa-search"></i> Search</a>
            <a href='?bookmarks' @click.prevent='$store.dispatch("clickBookmarks"); $store.dispatch("moveToList");'
                class="menu__item -bookmarks"><i class="fas fa-bookmark"></i>
                <span>Bookmarks ({{bookmarkedArray.length}})</span>
                <button @click.stop.prevent=' shareBookmarks' v-if='bookmarkedArray.length' class="fas fa-share-square"
                    title="Share bookmarks"></button>
            </a>
             <a href='javascript:print()' class="menu__item -print"><i class="fas fa-print"></i> Print</a>
            <!-- <a href='?seminars' @click.prevent='$store.dispatch("clickSeminars");' class="menu__item"><i class="fas fa-graduation-cap"></i> Seminars</a> -->

            <div class="menu__item" v-if="categoriesArray.length">Categories</div>
            <a class="menu__cat" :href='"?" + encodeURIComponent(c.slug)' v-for="c in categoriesArray" :key="c.id"
                @click.prevent='$store.dispatch("clickCategory", c.id);'>
                <div class="menu__cat-bullet">&bullet;</div>
                <div class="menu__cat-title">{{c.name}}</div>
                <div class="menu__cat-count">{{numOfExhibitors(c.id)}}</div>
            </a>
        </div>
    </OverlayContent>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from "vuex";
import OverlayContent from "./OverlayContent.vue";
import copyToClipboard from 'copy-to-clipboard';
import baseUrl from '@/tools/base-data-url';

const logoUrl = baseUrl + __data.logo;

window.setTimeout(function () {
    const link = document.createElement("link");
    link.href = logoUrl;
    link.rel = "preload";
    (link as any).as = "image";
    document.head.appendChild(link);
}, 4000);

export default {
    components: { OverlayContent },
    data: () => ({
        homeUrl: __data.homeUrl,
        logoUrl,
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
        shareBookmarks(e) {
            e.target.blur();
            const url = `${location.protocol}//${location.host}/?b=` + this.$store.getters.bookmarkedArray.join('|');
            copyToClipboard(url);
            alert("Link copied to clipboard.\nOpen it on another device to import bookmarks.");
        },
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
.expo-jtrade19 .menu__title {
    background: #2b2a29;
}
.expo-awslondon19 .menu__title,
.expo-awsamsterdam19 .menu__title,
.expo-awsstockholm19 .menu__title {
    background: rgb(47, 7, 122);
    background: linear-gradient(207deg, rgba(47, 7, 122, 1) 0%, rgba(175, 60, 119, 1) 47%, rgba(235, 97, 60, 1) 100%);
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
}
.expo-atxcws20 .menu__title {
    padding-top: 1rem;
    padding-bottom: 1rem;
    > img {
        max-height: 150px;
    }
}
.expo-expo .menu__title > img {
    padding-right: 2rem;
}
.expo-vaughanribfest19 .menu__title > img {
    width: auto;
}

.expo-sydneybuildexpo {
    .menu.shown .overlay-bar__close {
        color: #555 !important;
    }
    .menu__title {
        padding-top: 0;
        padding-bottom: 0.5rem;
        background: #bbbdc7;

        > img {
            max-height: 150px;
            width: auto;
        }
    }
}

.menu {
    background: #f1f1f1;
    &__title {
        display: block;
        padding: 2.5rem 1rem;
        font-size: 2rem;
        font-weight: 100;
        text-align: center;
        margin-right: -3rem;
        img {
            width: 220px;
            max-height: 100px;
            opacity: 0;
            transition: opacity 500ms;
        }
    }
    &__item {
        padding: 0.5rem 1rem;
        min-height: 3rem;
        display: block;
        font-weight: 600;
        display: flex;
        align-items: center;
        color: #000 !important;
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
        &.-bookmarks {
            > span {
                flex-grow: 1;
            }
            > button {
                padding: 0 0.4rem 0 0.4rem;
                margin-right: -0.4rem;
                border: none;
                cursor: pointer;
                align-self: stretch;
                &:hover {
                    color: #000;
                }
            }
        }

        .overlay-bottom &.-print {
           display: none;
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
        color: #555 !important;
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
