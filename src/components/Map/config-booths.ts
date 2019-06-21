// import { requireUpdate } from "./draw";
import configBoothBg from './config-booth-bg';
import configBoothBookmark from './config-booth-bookmark';
// import configBoothType from './config-booth-type';
import configBoothLabels from './config-booth-labels';
import configBoothLabelsSpecial from './config-booth-labels-special';
import configBoothBorder from './config-booth-border';
import BoothDrawerBase from "./BoothDrawerBase";
// import { isWebGlSupported } from "./utils";
// const boothDrawers = new Map<number, BoothDrawerBase<any>[]>();
// const boothStateCache = new Map<number, BoothState>();

export default function config() {
    const booths = store.getters.boothsArray as Booth[];
    const configFuncs = [configBoothBg, configBoothLabels, configBoothLabelsSpecial, configBoothBookmark, configBoothBorder] as ((Booth) => BoothDrawerBase<any>)[];//configBoothType,

    for (const b of booths) {
        // const ar: BoothDrawerBase<any>[] = [];
        for (const func of configFuncs) {
            //const drawer = 
            func(b);
            // if (drawer) ar.push(drawer);
        }
        // for (const Class of drawerClasses) {
        //     if (b.noLabels && Class === BoothLabelDrawer) continue;
        //     ar.push(new Class(b));
        // }
        // boothDrawers.set(b.id, ar);
    }
};

// if (isWebGlSupported()) {
//     store.watch(((s, g) => g.hoveredBoothIds) as any, (v: number[], oldV: number[]) => {
//         handleBoothSetsDifference(new Set(v), new Set(oldV));
//     });

//     store.watch(((s, g) => g.listBoothsIdsSet) as any, (v: Set<number>, oldV: Set<number>) => {
//         handleBoothSetsDifference(v, oldV);
//     });

//     store.watch(((s, g) => g.selectedBoothIdsSet) as any, (v: Set<number>, oldV: Set<number>) => {
//         handleBoothSetsDifference(v, oldV);
//     });

//     store.watch(((s, g) => g.bookmarkedArray) as any, (v: number[], oldV: number[]) => {
//         const oldExhibitors = oldV.map(id => store.state.exhibitors[id].booths as number[]).reduce((p, c) => p.concat(c), []);
//         const exhibitors = v.map(id => store.state.exhibitors[id].booths as number[]).reduce((p, c) => p.concat(c), []);
//         handleBoothSetsDifference(new Set(exhibitors), new Set(oldExhibitors));
//     });
// }

// function handleBoothSetsDifference(v: Set<number>, oldV: Set<number>) {
//     const newElements = Array.from(v).filter(x => !oldV.has(x));
//     const missingElements = Array.from(oldV).filter(x => !v.has(x));

//     for (const boothId of newElements.concat(missingElements)) {
//         // invalidte booth state
//         boothStateCache.delete(boothId);
//         const ar = boothDrawers.get(boothId);
//         ar.forEach(d => requireUpdate(d.updateBound));
//     }
// }

// interface BoothState {
//     hover: boolean;
//     selected: boolean;
//     skipDim: boolean;
//     error: boolean;
//     empty: boolean;
//     onhold: boolean;
//     bookmarked: boolean;
// }

// export function getBoothState(b: Booth) {
//     let state = boothStateCache.get(b.id);
//     if (!state) {
//         const g = store.getters;
//         const hover = g.hoveredBoothIds.indexOf(b.id) !== -1;
//         const selected = !!g.selectedBoothIdsSet.has(b.id);
//         const inList = g.listBoothsIdsSet.has(b.id);
//         const skipDim = inList || selected;
//         const onhold = b.special == false && b.onHold;
//         const empty = b.special == false && b.exhibitors.length === 0;
//         const error = !!b.error;
//         const bookmarked = b.special == false && !!b.exhibitors.find(e => store.state.bookmarked[e]);
//         state = { hover, selected, skipDim, error, empty, onhold, bookmarked };

//         boothStateCache.set(b.id, state);
//     }
//     return state;
// }

