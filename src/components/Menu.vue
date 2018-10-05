<template>
    <OverlayContent v-if="show" @close='close' @back='close' back-mode='none' class="overlaymenu" :class='{shown}'>
        <template slot="bar">
            <div class="bar">
                <a class="title" :href="EFP_HOME_URL" target="_blank">
                    <img :src="EFP_LOGO_URL" />
                </a>
            </div>
        </template>
        <div class="content">
            <a :href='EFP_HOME_URL' target="_blank" class="menu-item"><i class="fas fa-home"></i> Expo Home&nbsp;<i class="fas fa-external-link"></i></a>
            <a href='?bookmarks' @click.prevent='close(); $store.dispatch("selectBookmarks")' class="menu-item"><i class="fas fa-bookmark"></i> My Bookmarks</a>
            <div class="menu-item">Categories</div>
            <a class="cat" :href='"?" + encodeURIComponent(c.slug)' v-for="c in categoriesArray" :key="c.id" @click.prevent='close(); $store.dispatch("selectCategory", c.id)'>{{c.name}} ({{numOfExhibitors(c.id)}})</a>
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
        ...mapGetters(["categoriesArray"]),
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
.overlaymenu{
    background: #f1f1f1;
}
.title {
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
    .shown & img {
        opacity: 1;
    }
}


.menu-item {
    padding: 0.5rem 1rem;
    min-height: 3rem;
    display: block;
    font-weight: 700;
    display: flex;
    align-items: center;
    color: #555;
    text-decoration: none;

    > i:nth-child(2) {
        font-size: 0.7em;
        color: #aaa;
    }

    > i:first-child {
        color: #999;
        min-width: 1.6rem;
        text-align: center;
        padding-right: 0.5rem;
    }
}
div.menu-item {
    border-top: solid 1px #ddd;
    padding-bottom: 0;
}
.content a:hover {
    background: rgba(0, 0, 0, 0.05);
}
.cat {
    display: block;
    padding: 0.5rem 1rem;
    min-height: 2.5rem;
    display: flex;
    align-items: center;
    color: #444;
    text-decoration: none;
    /* font-size: 0.9rem; */
    /* font-weight: 200; */
}
/* .block {
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
} */
</style>
