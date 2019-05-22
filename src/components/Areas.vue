<template>
    <div class="areas" :class="{ '-ready': ready }" v-if='shown'>
        <button @click="area('ground')">Ground Floor</button>
        <button @click="area('mezzanine')">Mezzanine</button>
        <button @click="area('first')">First Floor</button>
    </div>
</template>

<script lang="ts">
export default {
    data: () => ({ ready: false, shown: EFP_EXPO === "cbresupplypartner" }),
    computed: {

    },
    mounted() {

        window.setTimeout(() => {
            this.ready = true;
        }, 2000);
    },
    methods: {
        area(name) {
            this.$store.commit("setArea", name);
        }
    }
};
</script>
<style lang="scss">
.areas {
    position: fixed;
    top: 1.3rem;
    left: 25rem;
    opacity: 0;
    transition: 500ms opacity;
    &.-ready {
        opacity: 1;
    }

    > button {
        background: rgba(255, 255, 255, 0.9);
        min-width: 130px;
        line-height: 1.8rem;
        border: solid 1px #777;
        font-weight: 500;
        &.active {
            color: #fff;
            background: #0c1b30;
        }
        &:nth-child(n + 1) {
            margin-left: -1px;
        }
        cursor: pointer;
        outline: none;

        &:active {
            color: #333;
            background: #eee;
        }
    }

    /* .overlay-bottom & {
        display: none;
    } */
}
</style>