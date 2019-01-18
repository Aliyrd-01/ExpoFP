import { requireDrawer, requireUpdate } from "./draw";
import BoothBgDrawer from './config-booths-bg';
import BoothBorderDrawer from "./config-booths-border";
import BoothLabelDrawer from "./config-booths-labels";
import BoothBookmarkDrawer from "./config-booths-bookmark";

const boothBgDrawerById = new Map<number, BoothBgDrawer>();

export default function config() {
    const booths = store.getters.boothsArray as Booth[];
    for (const b of booths) {
        boothBgDrawerById.set(b.id, new BoothBgDrawer(b))
        new BoothLabelDrawer(b);
        new BoothBookmarkDrawer(b);
        new BoothBorderDrawer(b);
    }
};

store.watch(((s, g) => g.hoveredBoothIds) as any, (v: number[], oldV: number[]) => {
    handleBoothSetsDifference(new Set(v), new Set(oldV));
});

store.watch(((s, g) => g.selectedBoothIdsSet) as any, (v: Set<number>, oldV: Set<number>) => {
    handleBoothSetsDifference(v, oldV);
});


function handleBoothSetsDifference(v: Set<number>, oldV: Set<number>) {
    const newElements = Array.from(v).filter(x => !oldV.has(x));
    const missingElements = Array.from(oldV).filter(x => !v.has(x));

    for (const boothId of newElements.concat(missingElements)) {
        const dr = boothBgDrawerById.get(boothId);
        requireUpdate(dr.updateBound);
    }
}


