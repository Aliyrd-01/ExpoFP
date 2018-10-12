<template>
    <OverlayContent class='exhibitor' v-if="show" :class={bookmarked} back-mode=none @close='$store.dispatch("selectNone")'>
        <template slot="bar">
            <div class="exhibitor__bar">
                {{exhibitor.name}} <i class="fas fa-gem" v-if='featured'></i>
                <a href='' @click.prevent="bookmark" class="exhibitor__bar-bk">
                    <i class="exhibitor__bk"></i>
                </a>
            </div>
        </template>
        <div class="exhibitor__details">
            <div class="exhibitor__booth">Booth
                <span v-for="booth in booths" :key="booth.id">
                    {{booth.name}}
                </span>
            </div>
            <div class="exhibitor__categories">
                <a :href='"?" + encodeURIComponent(c.slug)' v-for="c in categories" :key="c.id" @click.prevent="handleCategoryClick(c)">{{c.name}}</a>
            </div>
            <div class="exhibitor__description" v-if="exhibitor.description || exhibitor.logo">
                <div class='exhibitor__logo-container'>
                    <img :src="exhibitor.logo" class="exhibitor__logo" :key='exhibitor.id'>
                </div>
                {{exhibitor.description}}
            </div>
            <div class="exhibitor__meta">
                <div v-if="exhibitor.address || exhibitor.address2">
                    <i class="fas fa-map-marker"></i>
                    <div>
                        {{exhibitor.address}}<br />{{exhibitor.address2}}
                    </div>
                </div>
                <div v-if="exhibitor.phone1">
                    <i class="fas fa-phone"></i>
                    <div>
                        {{exhibitor.phone1}}
                    </div>
                </div>
                <div v-if="exhibitor.website">
                    <i class="fas fa-browser"></i>
                    <div>
                        <a :href="exhibitor.website" target="_blank">{{exhibitor.website}}</a>
                    </div>
                </div>
            </div>
            <div class="exhibitor__social">
                <a :href="exhibitor.facebook" target="_blank" v-if="exhibitor.facebook">
                    <i class='fab fa-facebook'></i>
                </a>
                <a :href="exhibitor.instagram" target="_blank" v-if="exhibitor.instagram">
                    <i class='fab fa-instagram'></i>
                </a>
                <a :href="exhibitor.linkedin" target="_blank" v-if="exhibitor.linkedin">
                    <i class='fab fa-linkedin'></i>
                </a>
                <a :href="exhibitor.twitter" target="_blank" v-if="exhibitor.twitter">
                    <i class='fab fa-twitter'></i>
                </a>
                <a :href="exhibitor.googlePlus" target="_blank" v-if="exhibitor.googlePlus">
                    <i class='fab fa-google-plus'></i>
                </a>
                <a :href="exhibitor.xing" target="_blank" v-if="exhibitor.xing">
                    <i class='fab fa-xing'></i>
                </a>
                <a :href="exhibitor.youtube" target="_blank" v-if="exhibitor.youtube">
                    <i class='fab fa-youtube'></i>
                </a>
            </div>
        </div>
    </OverlayContent>

</template>

<script lang="ts">
import { mapGetters, mapState } from "vuex";
import OverlayContent from "./OverlayContent.vue";

export default {
    components: { OverlayContent },
    computed: {
        ...mapState(["menu", "details"]),
        show() {
            return !this.menu && this.details && this.details.type === "exhibitor";
        },
        exhibitor() {
            return this.$store.getters.selectedExhibitor;
        },
        booths() {
            return this.exhibitor.booths.map(b => this.$store.state.booths[b]);
        },
        categories() {
            return this.exhibitor.categories.map(b => this.$store.state.categories[b]);
        },
        websiteUrl() {
            return this.e;
        },
        bookmarked() {
            return this.$store.state.bookmarked[this.exhibitor.id];
        },
        featured() {
            return this.exhibitor.isFeatured;
        }
    },
    watch: {
        exhibitor() {
            this.$el.parentElement.scrollTop = 0;
        }
    },
    methods: {
        handleCategoryClick(c) {
            this.$store.dispatch("selectCategory", c.id);
        },
        bookmark() {
            this.$store.commit("setBookmarked", { id: this.exhibitor.id, yes: !this.bookmarked });
        }
    }
};
</script>

<style  lang="scss">
.exhibitor {
    &__booth {
        margin: 0 1rem 0.2rem;
        color: #777;
    }
    &__categories {
        margin: 0 0 1rem;
        font-size: 0.9rem;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        > a {
            margin: 0 1rem;
        }
    }
    &__logo-container {
        width: 75px;
        height: 75px;
        float: left;
        margin: 0.3rem 0.8rem 0.4rem 0;
        border: solid 1px #ddd;
        border-radius: 5px;
        overflow: hidden;
        display: flex;
        align-items: center;
    }
    &__logo {
        max-width: 100%;
        max-height: 100%;
        // height: 75px;
    }
    &__description {
        margin: 1rem;
        font-size: 0.9rem;
        color: #444;
        padding-bottom: 1rem;
        border-bottom: solid 1px #eee;
        @include clearfix;
    }

    &__meta {
        > div {
            display: flex;
            margin: 0.8rem 0;

            > .fas {
                text-align: center;
                min-width: 3rem;
                margin-top: 0.1rem;
                color: #ccc;
                font-size: 1rem;
            }
            > div {
                font-size: 0.9rem;
                line-height: 1.2rem;
                color: #333;
            }
        }
    }
    &__social {
        border-top: solid 1px #eee;
        margin: 1rem;

        display: flex;
        padding-top: 1rem;
        > a {
            font-size: 1.5rem;
            text-decoration: none;
            color: #777;
            margin: 0 1rem 0.5rem 0;
            &:hover {
                color: var(--link-color-hover);
            }
        }
    }

    &__bar {
        min-height: 3.5rem;
        position: relative;
        line-height: 1.5rem;
        color: #333;
        font-weight: 500;
        margin-left: 1rem;
        font-size: 1.1em;
        flex-grow: 1;
        display: flex;
        align-items: center;
        > .fa-gem {
            color: #02a8ff;
            margin-left: 0.2rem;
            font-size: 0.85rem;
        }
    }

    &__bar-bk {
        position: absolute;
        right: 0;
        top: 0;
        padding: 0 1rem 1rem 1rem;
        /* align-self: stretch; */
    }

    &__bk {
        @include bookmark;
    }
}
</style>
