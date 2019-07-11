<template>
    <div class="demo" :class='{hidden, top}'>
        <section>
            <!-- <span>This is not an official Expo!Expo!® plan. </span> -->
            <div class="demo__message"><span>Get your free floor plan at
                    <a href='https://expofp.com/' target="_blank">ExpoFP.com</a></span></div>
            <a href='' @click.prevent='dismiss()' class='demo__dismiss'>Dismiss</a>
        </section>
    </div>
</template>

<script lang="ts">
export default {
    data: () => ({ hidden: true, key: 'note-dismissed3' }),
    computed: {
        top() {
            return window.innerWidth <= 820;
        }
    },
    mounted() {
        if (!sessionStorage.getItem(this.key)) {
            window.setTimeout(() => {
                this.hidden = false;
            }, 2000);
        }
    },
    methods: {
        dismiss() {
            this.hidden = true;
            sessionStorage.setItem(this.key, "1");
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

    min-height: 2rem;

    > section {
        display: flex;
        font-size: 0.8rem;
        user-select: none;
        padding: 0.2rem 0.5rem;
    }

    &__message {
        color: #fff;
        display: flex;
        align-items: center;
        a {
            color: #fff;
            text-decoration: underline;
        }
    }

    &__dismiss {
        display: flex;
        align-items: center;
        background: #1378d5;
        color: #fff;
        padding: 0.1rem 0.8rem;
        text-decoration: none;
        border-radius: 2px;
        font-weight: 500;
        font-size: 0.8rem;
        &:hover {
            background: #69b7ff;
        }
        margin-left: 0.5rem;
        @media print {
            display: none;
        }
    }

    transition: all 0.5s;
    opacity: 1;
    bottom: 0;
    &.top {
        bottom: unset;
        min-height: 2.5rem;
        top: 0;
        width: 100%;
        > section {
            flex-grow: 1;
        }
        span {
            display: inline-block;
        }

        .demo__message {
            flex-grow: 1;
        }
    }

    &.hidden {
        transform: translate(0, 100%);
    }
    &.top.hidden {
        transform: translate(0, -100%);
    }
}
</style>