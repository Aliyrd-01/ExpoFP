<template>
    <a class="row" :class="{bookmarked}" @mouseover="mouseover" @mouseout="mouseout" :href="`?${exhibitor.id}`" @click.prevent="select">
        <div class="lines">
            {{exhibitor.name}}
        </div>
        <div ref="bookmark" class="bookmark" tabindex="0" @click.prevent.stop="bookmark" title="Toggle bookmark">
            <i class="bk"></i>
        </div>
        <div class="booth">
            <div v-for="booth in booths" :key="booth.id">
                {{booth.name}}
            </div>
        </div>
    </a>
</template>

<script lang="ts">
export default {
    name: "ListRow",
    props: ["exhibitor"],
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
        }
    }
};
</script>

<style scoped lang="scss">

.row {
    display: flex;
    align-items: center;
    border-top: solid 1px #ebebeb;
    min-height: 3.5rem;
    text-decoration: none;
    color: #333;
}
.row:hover {
    background-color: #f1f1f1;
}
.lines {
    padding: 0 0.1rem 0 1rem;
    flex-grow: 1;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.booth {
    padding: 0 1rem 0 0;
    min-width: 3.5rem;
    text-align: right;
    font-weight: 700;
    font-size: 0.9rem;
    color: #555;
}
.bookmark {
    align-self: stretch;
    padding: 0 0.5rem 0 1rem;
    outline: none;
}
// .fa-bookmark {
//     color: #bbb;
// }
// .bookmarked .bookmark > .fa-bookmark {
//     color: #e54839;
// }
.bk {
    @include bookmark;
}

</style>
