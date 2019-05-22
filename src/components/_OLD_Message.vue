<template>
    <div class="message" :class='{hidden, top}' v-if="message">
        <section>
            <!-- <span>This is not an official Expo!Expo!® plan. </span> -->
            <div class="message__message"><span>{{msg}}</span></div>
            <a href='' @click.prevent='dismiss()' class='message__dismiss'>Dismiss</a>
        </section>
    </div>
</template>

<script lang="ts">
export default {
    data: () => ({ hidden: true, key: 'message-dismissed3' }),
    computed: {
        message() {
            return EFP_EXPO === "cbresupplypartner";
        },
        top() {
            return window.innerWidth <= 820;
        },
        msg() {
            if (is_touch_device()) {
                return "Double-tap or use pinch-to-zoom to zoom in and out";
            } else {
                return "Double-click map or use scroll to zoom in and out";
            }
            function is_touch_device() {
                var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
                var mq = function (query) {
                    return window.matchMedia(query).matches;
                }

                if (('ontouchstart' in window) || window['DocumentTouch'] && document instanceof window['DocumentTouch']) {
                    return true;
                }

                // include the 'heartz' as a way to have a non matching MQ to help terminate the join
                // https://git.io/vznFH
                var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
                return mq(query);
            }
        }
    },
    mounted() {
        if (this.message && !sessionStorage.getItem(this.key)) {
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
.message {
    position: fixed;
    width: 100%;
    display: flex;
    justify-content: center;
    background: #006a4c;
    background: linear-gradient(90deg, #004f39, #00c58d);

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
        background: #00120d;
        color: #fff;
        padding: 0.1rem 0.8rem;
        text-decoration: none;
        border-radius: 2px;
        font-weight: 500;
        font-size: 0.8rem;
        &:hover {
            background: #00120d;
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

        .message__message {
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