<template>
    <div>
        <component v-for="item in items" :is='item.component' :key="item.obj.id" :exhibitor="item.obj" />
    </div>
</template>

<script lang="ts">
import { mapGetters, mapState } from "vuex";
import { rtp } from "@/utils";
import ExhibitorRow from "./ExhibitorRow.vue";
import CategoryRow from "./CategoryRow.vue";
const components = { ExhibitorRow, CategoryRow };

const n = Math.ceil((Math.max(window.innerHeight, window.innerWidth) - rtp(3.5 + 2)) / rtp(3.5));
console.log('List n:', n);

export default {
    components,
    computed: {
        ...mapState(["overlayShowsAll"]),
        ...mapGetters(["listItems"]),
        items() {
            console.log('', this.listItems)
            let items;
            if (this.overlayShowsAll || this.listItems.length <= n) items = this.listItems;
            else items = this.listItems.slice(0, n);

            const mappedItems = items.map(x => {
                let component = components[x.type[0].toUpperCase() + x.type.substring(1) + 'Row'];
                console.log(component);
                return { ...x, component };
            });

            return mappedItems;
        },
    }
};
</script>

<style scoped lang="scss">
</style>
