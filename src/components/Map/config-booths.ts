import { requireDrawer, requireUpdate } from "./draw";
import BoothBgDrawer from './config-booths-bg';
import BoothBorderDrawer from "./config-booths-border";
import BoothLabelDrawer from "./config-booths-labels";
import BoothBookmarkDrawer from "./config-booths-bookmark";
import { BoothDrawerBase } from "./config-booths-base";

// const boothBgDrawerById = new Map<number, BoothBgDrawer>();
// const boothBookmarkDrawerById = new Map<number, BoothBookmarkDrawer>();
const boothDrawers = new Map<number, BoothDrawerBase[]>();
const boothStateCache = new Map<number, BoothState>();

export default function config() {
    const booths = store.getters.boothsArray as Booth[];
    const drawerClasses = [BoothBgDrawer, BoothLabelDrawer, BoothBookmarkDrawer, BoothBorderDrawer];
    for (const b of booths) {
        const ar: BoothDrawerBase[] = [];
        for (const Class of drawerClasses) {
            ar.push(new Class(b));
        }
        boothDrawers.set(b.id, ar);
    }
};

store.watch(((s, g) => g.hoveredBoothIds) as any, (v: number[], oldV: number[]) => {
    handleBoothSetsDifference(new Set(v), new Set(oldV));
});

store.watch(((s, g) => g.listBoothsIdsSet) as any, (v: Set<number>, oldV: Set<number>) => {
    handleBoothSetsDifference(v, oldV);
});

store.watch(((s, g) => g.selectedBoothIdsSet) as any, (v: Set<number>, oldV: Set<number>) => {
    handleBoothSetsDifference(v, oldV);
});

store.watch(((s, g) => g.bookmarkedArray) as any, (v: number[], oldV: number[]) => {
    const oldExhibitors = oldV.map(id => store.state.exhibitors[id].booths as number[]).reduce((p, c) => p.concat(c));
    const exhibitors = v.map(id => store.state.exhibitors[id].booths as number[]).reduce((p, c) => p.concat(c));
    handleBoothSetsDifference(new Set(exhibitors), new Set(oldExhibitors));
});

function handleBoothSetsDifference(v: Set<number>, oldV: Set<number>) {
    const newElements = Array.from(v).filter(x => !oldV.has(x));
    const missingElements = Array.from(oldV).filter(x => !v.has(x));

    for (const boothId of newElements.concat(missingElements)) {
        // invalidte booth state
        boothStateCache.delete(boothId);
        const ar = boothDrawers.get(boothId);
        ar.forEach(d => requireUpdate(d.updateBound));
    }
}

interface BoothState {
    hover: boolean;
    selected: boolean;
    skipDim: boolean;
    error: boolean;
    empty: boolean;
    bookmarked: boolean;
}

export function getBoothState(b: Booth) {
    let state = boothStateCache.get(b.id);
    if (!state) {
        const g = store.getters;
        const hover = g.hoveredBoothIds.indexOf(b.id) !== -1;
        const selected = !!g.selectedBoothIdsSet.has(b.id);
        const inList = g.listBoothsIdsSet.has(b.id);
        const skipDim = inList || selected;

        const empty = b.exhibitors.length === 0;
        const error = !!b.error;
        const bookmarked = !!b.exhibitors.find(e => store.state.bookmarked[e]);
        state = { hover, selected, skipDim, error, empty, bookmarked };

        boothStateCache.set(b.id, state);
    }
    return state;
}

