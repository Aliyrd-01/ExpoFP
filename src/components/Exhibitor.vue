<template>
    <OverlayContent class='exhibitor' :class="{'-exhibitor-featured': featured, bookmarked}" v-if="show" back-mode=none
        @close='$store.dispatch("selectNone")' :particles=featured>
        <template slot="bar">
            <div class="exhibitor__bar">
                <span @click='$store.dispatch("toggleMapOverlay")'>
                    <span>{{exhibitor.name}} </span>
                    <i class="fas fa-gem" v-if='featured'></i>
                </span>
                <a href='' @click.prevent="bookmark" class="exhibitor__bar-bk">
                    <BookmarkSvg />
                </a>
            </div>
            <div class="exhibitor__bar-booth" @click='$store.dispatch("toggleMapOverlay")'>{{__data.boothTerm}}
                <span v-for="booth in booths" :key="booth.id">
                    {{booth.name}}
                </span></div>
        </template>
        <div class="exhibitor__details">
            <div class="exhibitor__categories">
                <a href='' v-for="booth in booths" :key="booth.id" @click.prevent='$store.dispatch("toggleMapOverlay")'
                    class="exhibitor__categories-booth">{{__data.boothTerm}} {{booth.name}}</a>
                <a :href='"?" + encodeURIComponent(c.slug)' v-for="c in categories" :key="c.id" @click.prevent="handleCategoryClick(c)"
                    class="exhibitor__categories-cat">{{c.name}}</a>
            </div>
            <div class="exhibitor__description" :class='{collapsed : collapsed && !disableCollapse}' v-if="exhibitor.description || exhibitor.logo">
                <div class='exhibitor__logo-container' v-if="exhibitor.logo">
                    <img :src="exhibitor.logo" class="exhibitor__logo" :key='exhibitor.id'>
                </div>
                <span class="exhibitor__description-html" v-html="exhibitor.description" @click='collapsed=false'></span>
            </div>
            <div class="exhibitor__sep" v-if=anyAddress></div>
            <div class="exhibitor__edit" v-if=showEdit><button class="far fa-pencil" title="Edit" @click="sendLoginLink"></button></div>
            <div class="exhibitor__meta" v-if=anyAddress>
                <div v-if="exhibitor.address || exhibitor.address2">
                    <i class="fas fa-map-marker"></i>
                    <div>
                        {{exhibitor.address}}
                        <div v-if="exhibitor.address2">{{exhibitor.address2}}</div>
                        <div v-if="exhibitor.city || exhibitor.state || exhibitor.zip">
                            {{exhibitor.city}}<span v-if="exhibitor.city && exhibitor.state">,</span>
                            {{exhibitor.state}}
                            {{exhibitor.zip}}
                        </div>
                        <div v-if="exhibitor.country">{{exhibitor.country}}</div>
                    </div>
                </div>
                <div v-if="exhibitor.phone1">
                    <i class="fas fa-phone"></i>
                    <div>
                        <a :href="'tel:'+exhibitor.phone1">{{exhibitor.phone1}}</a>
                    </div>
                </div>
                <div v-if="exhibitor.website">
                    <i class="fas fa-globe"></i>
                    <div>
                        <a :href="exhibitor.website" target="_blank">{{websiteTrimmed}}</a>
                    </div>
                </div>
                <div v-if="exhibitor.email">
                    <i class="fas fa-at"></i>
                    <div>
                        <a :href="'mailto:' + exhibitor.email" target="_blank">{{exhibitor.email}}</a>
                    </div>
                </div>
            </div>
            <div class="exhibitor__sep" v-if=anySocial></div>
            <div class="exhibitor__social" v-if='anySocial'>
                <a :href="exhibitor.facebook" target="_blank">
                    <i class='fab fa-facebook'></i>
                </a>
                <a :href="exhibitor.instagram" target="_blank">
                    <i class='fab fa-instagram'></i>
                </a>
                <a :href="exhibitor.linkedin" target="_blank">
                    <i class='fab fa-linkedin'></i>
                </a>
                <a :href="exhibitor.twitter" target="_blank">
                    <i class='fab fa-twitter'></i>
                </a>
                <a :href="exhibitor.googlePlus" target="_blank">
                    <i class='fab fa-google-plus'></i>
                </a>
                <a :href="exhibitor.xing" target="_blank">
                    <i class='fab fa-xing'></i>
                </a>
                <a :href="exhibitor.youtube" target="_blank">
                    <i class='fab fa-youtube'></i>
                </a>
            </div>
        </div>
    </OverlayContent>

</template>

<script lang="ts">
import { mapGetters, mapState } from "vuex";
import OverlayContent from "./OverlayContent.vue";
import BookmarkSvg from "./BookmarkSvg.vue";

export default {
    components: { OverlayContent, BookmarkSvg },
    data: () => ({ collapsed: true }),
    computed: {
        ...mapState(["menu", "details"]),
        ...mapGetters(["overlayPosition"]),
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
        websiteTrimmed() {
            return this.exhibitor.website ? this.exhibitor.website.replace(/^(http(s?):\/\/)([^/]+)(\/)?$/i, "$3") : "";
        },
        bookmarked() {
            return this.$store.state.bookmarked[this.exhibitor.id];
        },
        featured() {
            //if (__settings.debug) return true;
            // return true;
            return this.exhibitor.featured;
        },
        anySocial() {
            return !!["facebook", "instagram", "linkedin", "twitter", "googlePlus", "xing", "youtube"].find(
                s => this.exhibitor[s]
            );
        },
        anyAddress() {
            return !!["address", "address2", "phone1", "website", "email"].find(
                s => this.exhibitor[s]
            );
        },
        disableCollapse() {
            return !this.anySocial && !this.anyAddress || this.overlayPosition === "left" && (this.exhibitor.description || '').length < 800;
        },
        // showAnimation() {
        //     return this.show && this.featured;
        // },
        showEdit() {
            return __data.sendLoginLinkUrl && this.sendLinkEmail;
        },
        sendLinkEmail() {
            return this.exhibitor.privateEmail || this.exhibitor.email;
        }
    },
    watch: {
        exhibitor() {
            this.$el.parentElement.scrollTop = 0;
            this.collapsed = true;
        },
    },
    methods: {
        handleCategoryClick(c) {
            this.$store.dispatch("selectCategory", c.id);
        },
        sendLoginLink(e) {
            e.target.blur();
            const email = this.sendLinkEmail;
            if (!confirm(`Send login instructions to ${email} to edit profile?`)) return;
            if (EFP_EXPO !== "expo") return;
            const xhr = new XMLHttpRequest();
            xhr.open("POST", __data.sendLoginLinkUrl);
            xhr.setRequestHeader("Content-Type", "application/json");
            function er() {
                alert("Error sending login instructions.");
            }
            xhr.onload = function (e) {
                if (this.status !== 200) {
                    er();
                    return;
                }
                alert(`A link to edit profile was sent to ${email}.`)
            };
            xhr.onerror = function (e) {
                __logger.error("Error", e);
                er();
            };
            xhr.send(JSON.stringify({ "id": this.exhibitor.id }));
        },
        bookmark() {
            this.$store.commit("setBookmarked", { id: this.exhibitor.id, yes: !this.bookmarked });
        }
    }
};
</script>

<style lang="scss">
.expo-jtrade19 .exhibitor__categories-booth {
    background: #e9522a; //#fb3e59;
    &:hover {
        background: #e9522a; //#ea2b46;
    }
}

.overlay-content.-exhibitor-featured {
    background: #230762;
    color: #fff;
    .exhibitor__bar,
    .exhibitor__meta {
        color: #fff;
    }
}

.exhibitor {
    // &__booth {
    //     margin: 0 1rem 0.2rem;
    //     color: #777;
    // }
    &__categories {
        margin: 0rem 1rem 1rem 0.7rem;
        font-size: 0.9rem;
        // display: flex;
        // flex-direction: column;
        // align-items: flex-start;
        > a {
            display: inline-block;

            color: #fff !important;
            font-size: 0.8rem;
            padding: 0.3rem 0.6rem;
            border-radius: 1em;
            margin: 0.3rem 0 0 0.3rem;
            text-decoration: none !important;
        }

        &-cat {
            background: #41b6e7;
            &:hover {
                background: #1598d0;
            }
        }

        &-booth {
            background: #fb3e59;
            &:hover {
                background: #ea2b46;
            }
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
        position: relative;
        z-index: 2;
        background: #fff;
    }
    &__logo {
        max-width: 100%;
        max-height: 100%;

        // height: 75px;
    }
    &__description {
        margin: 1rem;
        font-size: 0.9rem;

        position: relative;

        /* &-show {
            display: none;
            position: absolute;
            z-index: 2;
            bottom: -0.7em;
            width: 100%;
            padding-left: 87px;
            // text-align: center;
            // display: block;
            // font-size: 2rem;
            text-decoration: none !important;
        } */

        &-html {
            > *:first-child {
                margin-top: 0;
                padding-top: 0;
            }
            > *:last-child {
                margin-bottom: 0;
                padding-bottom: 0;
            }
        }

        &.collapsed > .exhibitor__description-html {
            cursor: pointer;
            &:hover {
                opacity: 1;
            }
            opacity: 0.8;
            height: 6.5em;
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
            -webkit-mask-image: linear-gradient(rgba(0, 0, 0, 1) 35%, transparent 90%);
            mask-image: linear-gradient(rgba(0, 0, 0, 1) 35%, transparent 90%);
        }

        @include clearfix;
    }

    &__sep {
        margin: 1rem;
        border-top: dotted 1px #ddd;
    }

    &__meta {
        color: #333;
        > div {
            display: flex;
            margin: 0.8rem 1rem;
            overflow: hidden;

            > .fas,
            > .far {
                text-align: center;
                min-width: 0.8rem;
                margin-top: 0.2rem;
                color: #ccc;
                font-size: 0.8rem;
            }
            > div {
                font-size: 0.85rem;
                line-height: 1.1rem;

                margin-left: 0.4rem;
                text-overflow: ellipsis;
                overflow: hidden;
                // font-weight: 200;
            }
        }
    }
    &__social {
        margin: 0 1rem 2rem;

        display: flex;
        // justify-content: space-between;
        // padding-top: 1rem;
        > a {
            font-size: 2rem;
            text-decoration: none;

            margin: 0 1rem 0.5rem 0;
            color: #eee;
            display: none;
            &:hover {
                color: #eee;
            }
            &[href] {
                display: block;
                color: var(--link-color);

                &:hover {
                    color: var(--link-color-hover);
                }
            }
        }
    }

    &__bar {
        min-height: 2.5rem;
        position: relative;
        line-height: 1.5rem;
        color: #333;
        font-weight: 600;
        padding-top: 1rem;
        margin-left: 1rem;
        font-size: 1.1em;
        flex-grow: 1;
        // display: flex;
        // align-items: center;
        .fa-gem {
            color: #02a8ff;
            margin-left: 0.2rem;
            font-size: 0.85rem;
            line-height: 1.5rem;
        }
        > span {
            display: flex;
            > span {
                white-space: nowrap;
                max-width: 18rem;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }
    }
    &__bar-booth {
        margin-left: 1rem;
        font-size: 0.7rem;
        color: #777;
        display: block;
        font-weight: normal;
        height: 1rem;
        line-height: 1em;
        opacity: 0;
        transition: opacity 200ms;
        .overlay-bar.scrolled & {
            opacity: 1;
        }
    }

    &__bar-bk {
        position: absolute;
        right: 0;
        top: 0;
        padding: 0 1rem 1rem 1rem;
        /* align-self: stretch; */
    }

    &__edit {
        position: relative;
        display: none;
        > button {
            position: absolute;
            right: 1rem;
            padding: 0 0 1rem 1rem;
            border: 0;
            cursor: pointer;
            color: #aaa;
            &:hover {
                color: #555;
            }
        }

        .exhibitor__details:hover > & {
            display: block;
        }
    }
}
</style>
