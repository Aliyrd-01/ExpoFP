<template>
    <a :href='"?" + encodeURIComponent(category.slug)' @click.prevent='click' class="category-row">
        <div class="category-row__main">{{category.name}} ({{numOfExhibitors}})</div>
        <div class="category-row__sub">Category</div>
    </a>
</template>

<script lang="ts">
export default {
    name: "CategoryRow",
    props: ["category"],
    methods: {
        click() {
            this.$store.dispatch("clickCategory", this.category.id);
        },
    },
    computed: {
        numOfExhibitors: function () {
            return this.$store.getters.exhibitorsArray.filter(e =>
                e.categories.indexOf(this.category.id) !== -1).length;
        }
    }
};
</script>

<style lang="scss">
.category-row {
    border-top: solid 1px #ebebeb;
    min-height: 3.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-decoration: none !important;
    color: #333 !important;
    $p: 1rem;
    @media (hover: hover) {
        &:hover {
            background-color: #f1f1f1;
        }
    }

    &__main {
        padding: 0 $p 0;
        height: 1.3125rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    &__sub {
        font-size: 0.7rem;
        color: #aaa;
        padding: 0 0 0 $p;
        height: 0.7rem;
        margin: -2px 0;
    }
}
</style>
