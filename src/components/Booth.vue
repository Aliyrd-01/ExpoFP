<template>
    <div class="booth">
        <div class="title">Booth {{booth.name}}</div>
        <div class="size" v-if='booth.size'>Size: {{booth.size}}</div>
        <div class="size" v-if='booth.price'>Price: {{booth.price}}</div>
    </div>

</template>

<script lang="ts">
// import { mapState, mapGetters } from "vuex";

export default {
    data: () => ({
       
    }),
    computed: {
        booth(){
            return this.$store.getters.selectedBooth;
        }
    },
};
</script>

<style scoped>
.booth {
    margin: 1rem 3rem;
}
.title{
    font-weight: 500;
}
</style>
