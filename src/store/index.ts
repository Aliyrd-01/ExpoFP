import { configure } from 'mobx';
import RootStore from './RootStore';

// import init from './init';
configure({ computedRequiresReaction: true, enforceActions: 'observed' });

const store = new RootStore();
// init(store1);
export default store;

// declare global {
//     const store: typeof store1;
// }

// extendGlobal({ store: store1 });

