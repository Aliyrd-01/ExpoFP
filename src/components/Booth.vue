<template>
    <div class="booth">
        <!-- <div class="title">Booth {{booth.name}}</div> -->
        <div class="info" v-if='booth.size'>Size: {{booth.size}}</div>
        <div class="info" v-if='booth.price'>Price: {{booth.price}}</div>
        <div class="buy">
            <button @click="buy">Buy</button>
        </div>
    </div>

</template>

<script lang="ts">
// import { mapState, mapGetters } from "vuex";

export default {
    data: () => ({}),
    computed: {
        booth() {
            return this.$store.getters.selectedBooth;
        }
    },
    methods: {
        buy(){
            alert('This functionality is disabled in the demo version');
        }
    }
};
</script>

<style scoped lang="scss">
.booth {
    margin: 0 1rem;
}
.title {
    font-weight: 500;
}
.buy {
    text-align: center;
    margin: 2rem 0;
}
button {
    border: none;
    background: #41b6e7;
    padding: 0.5rem 1rem;
    min-width: 10rem;
    color: #fff;
    transition: background-color 200ms;
    border-radius: 2px;
    &:hover {
        background: #2f99c7;
    }
    &:active{
        background: #2285af;
    }
}
</style>
