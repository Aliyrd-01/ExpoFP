import initCategories from './init-categories';
import initUi from './init-ui';
import RootStore from '../RootStore';
import initExhibitors from './init-exhibitors';

export default function initStore(store: RootStore) {
    initCategories(store);
    initExhibitors(store);
    initUi(store);
}