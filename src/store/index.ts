import { configure } from 'mobx';
import RootStore from './RootStore';
import init from './init';

configure({ computedRequiresReaction: true });

const store = new RootStore();
init(store);

export default store;
export const uiState = store.uiState;
export const exhibitorStore = store.exhibitorStore;
export const boothStore = store.boothStore;
export const categoryStore = store.categoryStore;



// declare global {
//     const store: typeof store1;
// }

// extendGlobal({ store: store1 });

