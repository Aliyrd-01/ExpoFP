<template>
    <div class="demo" :class='{hidden}' v-if="demo">
        <section>
            <a href='' @click.prevent='dismiss()' class='dismiss'>Dismiss</a>
            This is a demo of
            <a href='https://expofp.com/'>ExpoFP</a>
            floor plan. This is not the official in-cosmetics expo plan.

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
        if (this.demo && !sessionStorage.getItem("demo-dismissed") && window.innerWidth > 820) {
            window.setTimeout(() => {
                this.hidden = false;
            }, 2000);
        }
    },
    methods: {
        dismiss() {
            this.hidden = true;
            sessionStorage.setItem("demo-dismissed", "1");
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
    background: #ab40a0;
    background: linear-gradient(90deg, #e5175c, #5c17e5);
    /* top: 0; */
    color: #fff;

    > section {
        font-size: 0.8rem;
        user-select: none;
        padding: 0.2rem 0.5rem;
        > a {
            font-weight: 500;
            color: #69b7ff;
        }
        .dismiss {
            float: right;
            display: block;
            background: #1378d5;
            color: #fff;
            padding: 0.1rem 0.2rem;
            text-decoration: none;
            border-radius: 2px;
            font-weight: 500;
            font-size: 0.8rem;
            &:hover {
                background: #69b7ff;
            }
            margin-left: 0.5rem;
        }
    }
    transition: all 0.5s;
    opacity: 1;
    bottom: 0;
    &.hidden {
        transform: translate(0, 100%);
    }
}
</style>