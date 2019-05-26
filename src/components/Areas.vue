<template>
    <div class="areas" :class="{ '-ready': ready }" v-if='shown'>
        <button @click="area('ground')">Ground Floor</button>
        <button @click="area('mezzanine')">Level 1</button>
        <button @click="area('first')">Level 2</button>
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
    top: 0.5rem;
    right: 0.5rem;
    opacity: 0;
    transition: 500ms opacity;
    &.-ready {
        opacity: 1;
    }

    > button {
        background: rgba(12, 27, 48, 0.9);
        box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.3);
        color: #fff;
        min-width: 130px;
        line-height: 1.35rem;
        font-size: 0.85rem;
        border-radius: 2px;
        margin: 3px;
        border: none;
        /* border: solid 1px transparent; */
        font-weight: 500;
        &.active {
            color: #fff;
            background: #0c1b30;
        }
        &:nth-child(n + 1) {
            margin-left: 0;
        }
        cursor: pointer;
        outline: none;

        &:active {
            color: #eee;
            background: rgba(12, 27, 48, 1);
        }
    }

    .overlay-bottom & {
        top: 4.3rem;
        right: 0.5rem;
        > button {
            display: block;
            margin-top: 0;
        }
    }
}
</style>