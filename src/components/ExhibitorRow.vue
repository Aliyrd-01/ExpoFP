<template>
    <a class="exhibitor-row" :class="{bookmarked, featured}" @mouseover="mouseover" @mouseout="mouseout" :href="`?${exhibitor.slug}`"
        @click.prevent="select">
        <div class="exhibitor-row__lines">
            {{exhibitor.name}} <i class="fas fa-gem" v-if='featured'></i>
        </div>
        <div ref="bookmark" class="exhibitor-row__bookmark" tabindex="0" @click.prevent.stop="bookmark" title="Toggle bookmark">
            <BookmarkSvg />
        </div>
        <div class="exhibitor-row__booth">
            <div v-for="booth in booths" :key="booth.id">
                {{booth.name}}
            </div>
        </div>
    </a>
</template>

<script lang="ts">
import BookmarkSvg from "./BookmarkSvg.vue";

export default {
    name: "ExhibitorRow",
    props: ["exhibitor"],
    components: { BookmarkSvg },
    methods: {
        select() {
            this.$store.dispatch("clickExhibitor", this.exhibitor.id);
        },
        bookmark() {
            this.$refs.bookmark.blur();
            this.$store.commit("setBookmarked", { id: this.exhibitor.id, yes: !this.bookmarked });
        },
        mouseover() {
            if (this.$store.state.hoveredExhibitor !== this.exhibitor.id) {
                this.$store.commit("setHoveredExhibitor", this.exhibitor.id);
            }
        },
        mouseout() {
            this.$store.commit("setHoveredExhibitor", null);
        }
    },
    computed: {
        booths() {
            return this.exhibitor.booths.map(e => this.$store.state.booths[e]);
        },
        bookmarked() {
            return this.$store.state.bookmarked[this.exhibitor.id];
        },
        featured() {
            return this.exhibitor.featured;
        }
    }
};
</script>

<style lang="scss">
.exhibitor-row {
    display: flex;
    align-items: center;
    text-decoration: none !important;
    color: #333 !important;

    &.featured {
        .exhibitor-row__lines {
            font-weight: 700;
        }
    }

    &__lines {
        padding: 0 0.1rem 0 1rem;
        flex-grow: 1;

        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        > .fa-gem {
            color: #02a8ff;
            font-size: 0.9rem;
        }
    }
    &__booth {
        padding: 0 1rem 0 0;
        min-width: 3.5rem;
        text-align: right;
        font-weight: 700;
        font-size: 0.9rem;
        color: #555;
    }

    &__bookmark {
        align-self: stretch;
        padding: 0 0.5rem 0 1rem;
        outline: none;
    }
}
</style>
