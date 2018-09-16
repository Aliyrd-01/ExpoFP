<template>
    <div class="demo" :class='{hidden}' v-if="demo">
        <section>
            <a href='' @click.prevent='dismiss()' class='dismiss'>Dismiss</a>
            This is a demo of
            <a href='https://expofp.com/'>ExpoFP</a>
            floor plan. This is not an official in-cosmetics expo plan.

        </section>
    </div>
</template>

<script lang="ts">
export default {
    data: () => ({ hidden: true }),
    computed: {
        demo() {
            return EFP_EXPO === "demo";
        }
    },
    mounted() {
        if (this.demo) {
            window.setTimeout(() => {
                this.hidden = false;
            }, 2000);
        }
    },
    methods: {
        dismiss() {
            this.hidden = true;
        }
    }
};
</script>
<style scoped lang="scss">
.demo {
    position: fixed;
    width: 100%;
    display: flex;
    justify-content: center;
    background: #fff;

    > section {
        font-size: 0.8rem;
        user-select: none;
        padding: 0.2rem 0.5rem;
        > a {
            font-weight: 500;
            color: #1378d5;
        }
        .dismiss {
            float: right;
            display: block;
            background: #aaa;
            color: #fff;
            padding: 0.1rem 0.2rem;
            text-decoration: none;
            border-radius: 2px;
            font-weight: 500;
            font-size: 0.8rem;
            &:hover {
                background: #1378d5;
            }
            margin-left: 0.5rem;
        }
    }
    transition: all 0.5s;
    opacity: 1;
    transform: translate(0, 0);
    &.hidden {
        transform: translate(0, -100%);
        opacity: 0;
    }
}
</style>