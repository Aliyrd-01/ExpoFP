import RootStore from './RootStore';
import init from './init';

const store1 = new RootStore();
init(store1);
export default store1;

declare global {
    const store: typeof store1;
}

extendGlobal({ store: store1 });

