import initCategories from './init-categories';
import initUi from './init-ui';
import RootStore from '../RootStore';
import initExhibitors from './init-exhibitors';
import initBooths from './init-booths';

export default function initStore(store: RootStore) {
    initCategories(store);
    initBooths(store);
    initExhibitors(store);
    initUi(store);
}