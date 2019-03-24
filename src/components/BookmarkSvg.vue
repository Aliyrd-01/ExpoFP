<template>
    <svg width="12" height="18" class="bookmark-svg" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0 H12 V18 L6 12 L0 18 H0" />
    </svg>
</template>

<style lang="scss">
.bookmark-svg {
    display: block;
    fill: #ddd;
    .bookmarked & {
        fill: #e54839;
    }
}

</style>