import { configure } from "mobx";
// import FloorPlanReady from "../floorplan.ready";
import init from "./init";
import RootStore from "./RootStore";

configure({ computedRequiresReaction: true });

// export default function createStore(fp: FloorPlanReady) {
//     window["__store"] = store;
// }

const store = new RootStore();
init(store);

export default store;
export const uiState = store.uiState;
export const exhibitorStore = store.exhibitorStore;
export const boothStore = store.boothStore;
export const categoryStore = store.categoryStore;

window["__store"] = store;

// declare global {
//     const store: typeof store1;
// }

// extendGlobal({ store: store1 });

// autorun(()=>{
//     // console.log('debug store', uiState.previewExhibitor);
//     // console.log('aaaa', uiState.listItems.length, uiState.listItems)
// })
