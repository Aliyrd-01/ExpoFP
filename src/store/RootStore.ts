import { configure } from 'mobx';
import CategoryStore from './CategoryStore';
import UIState from './UIState';

configure({ computedRequiresReaction: true, enforceActions: 'observed' });

export default class RootStore {
    readonly categoryStore: CategoryStore;
    readonly uiState: UIState;
    
    constructor() {
        this.categoryStore = new CategoryStore(this);
        this.uiState = new UIState(this);
    }
}




