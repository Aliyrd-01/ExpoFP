<template>
    <div :class="{row:1, bookmarked}" @mouseover="mouseover" @mouseout="mouseout">

        <a :class="{icon:1, fal: !bookmarked, fas: bookmarked, 'fa-star':1}" href='' @click.prevent="bookmark">

        </a>
        <a class="link" :href="`?${exhibitor.id}`" @click.prevent="select">
            <div class="lines">
                <div>{{exhibitor.name}}</div>
                <div>{{exhibitor.name}}</div>
            </div>
            <div class="booth">
                <div v-for="booth in booths" :key="booth.id">
                    {{booth.name}}
                </div>
            </div>
        </a>
    </div>
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

<style scoped>
.row {
    display: flex;
    align-items: center;
    border-bottom: solid 1px #eee;
    /* transition: background-color 200ms; */
}
.row:hover{
    background-color: #f1f1f1;
}
.row a {
    text-decoration: none;
    color: #333;
}
a.icon {
    min-width: 3rem;
    font-size: 1.1rem;
    text-align: center;
    color: #ccc;
}
.bookmarked a.icon {
    color: #f3b501;
}
.link {
    display: flex;
    align-items: center;
    flex-grow: 1;
    padding: 0.5rem 0;
    min-height: 3.3rem;
}
.lines {
    flex-grow: 1;
    width: 5rem;
}
.lines > div:first-child {
    font-weight: 500;
    font-size: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.bookmarked .lines > div:first-child {
    font-weight: 700;
}
.lines > div:last-child {
    font-size: 0.7rem;
    color: #888;
    /* line-height: 0px; */
    display: none;
}
.booth {
    padding: 0 0.7rem;
    font-weight: 500;
    color: #4688c5;
    font-size: 0.9rem;
}
</style>
