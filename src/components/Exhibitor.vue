<template>
    <div class="details" :class={bookmarked}>
        <a :class="{icon:1, fal: !bookmarked, fas: bookmarked, 'fa-bookmark':1}" href='' @click.prevent="bookmark">

        </a>
        <div class="booth">Booth
            <span v-for="booth in booths" :key="booth.id">
                {{booth.name}}
            </span>
        </div>
        <div class="categories">
            <a :href='"?" + encodeURIComponent(c.name)' v-for="c in categories" :key="c.id" @click.prevent="handleCategoryClick(c.name)">{{c.name}}</a>
        </div>
        <div class="description" v-if="exhibitor.description || exhibitor.logo">
            <div class='logo-container'>
                <img :src="exhibitor.logo" class="logo" :key='exhibitor.id'>
            </div>
            {{exhibitor.description}}
        </div>
        <div class="meta">
            <div v-if="exhibitor.address || exhibitor.address2">
                <i class="fas fa-map-marker"></i>
                <div>
                    {{exhibitor.address}}<br/>{{exhibitor.address2}}
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
        <div class="social">
             <a :href="exhibitor.facebook" target="_blank" v-if="exhibitor.facebook"><i class='fab fa-facebook'></i></a>
             <a :href="exhibitor.instagram" target="_blank" v-if="exhibitor.instagram"><i class='fab fa-instagram'></i></a>
             <a :href="exhibitor.linkedin" target="_blank" v-if="exhibitor.linkedin"><i class='fab fa-linkedin'></i></a>
             <a :href="exhibitor.twitter" target="_blank" v-if="exhibitor.twitter"><i class='fab fa-twitter'></i></a>
             <a :href="exhibitor.googlePlus" target="_blank" v-if="exhibitor.googlePlus"><i class='fab fa-google-plus'></i></a>
             <a :href="exhibitor.xing" target="_blank" v-if="exhibitor.xing"><i class='fab fa-xing'></i></a>
             <a :href="exhibitor.youtube" target="_blank" v-if="exhibitor.youtube"><i class='fab fa-youtube'></i></a>
        </div>
    </div>

</template>

<script lant="ts">
export default {
    computed: {
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
            this.e;
        },
        bookmarked() {
            return this.$store.state.bookmarked[this.exhibitor.id];
        }
    },
    methods: {
        handleCategoryClick(name) {
            this.$store.dispatch("selectText", name);
        },
        bookmark() {
            this.$store.commit("setBookmarked", { id: this.exhibitor.id, yes: !this.bookmarked });
        }
    }
};
</script>

<style scoped lang="scss">
.details {
}
a.icon {
    text-decoration: none;
    color: #ccc;
    font-size: 1.1rem;
    display: block;
    float: right;
    margin: 0 1rem;
    padding-right: 1px;
}
.bookmarked a.icon {
    color: #e54839;
}
.booth {
    margin: 0 1rem 0.2rem;
    font-weight: 500;
    color: #777;
}
.categories {
    margin: 0 0 1rem;
    font-size: 0.9rem;
    > a {
        display: block;
        margin: 0 1rem;
    }
}
.logo-container {
    width: 75px;
    height: 75px;
    float: left;
    margin: 0.3rem 0.8rem 0.4rem 0;
    border: solid 1px #ddd;
    border-radius: 5px;
    overflow: hidden;
}
.logo {
    max-width: 100%;
    max-height: 100%;
    // height: 75px;
}
.description {
    margin: 1rem;
    font-size: 0.9rem;
    color: #444;
    padding-bottom: 1rem;
    border-bottom: solid 1px #eee;
}
.meta {
    > div {
        display: flex;
        margin: 0.8rem 0;

        > .fas {
            text-align: center;
            min-width: var(--iconWidth);
            margin-top: 0.1rem;
            color: #ccc;
            font-size: 1rem;
        }
        > div {
            font-size: 0.9rem;
            line-height: 1.2rem;
            color: #888;
        }
    }
}
.social {
    border-top: solid 1px #eee;
    margin: 1rem;
    
    display: flex;
    padding-top: 1rem;
    > a {
        font-size: 1.5rem;
        text-decoration: none;
        color: #777;
        margin: 0 1rem 0.5rem 0;
        &:hover{
            color: var(--link-color-hover);
        }
    }
}
</style>
