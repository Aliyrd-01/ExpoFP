import { action } from 'mobx';
import BoothStore from './BoothStore';
import CategoryStore from './CategoryStore';
import ExhibitorStore from './ExhibitorStore';
import UIState from './UIState';

export default class RootStore {


    readonly categoryStore: CategoryStore;
    readonly exhibitorStore: ExhibitorStore;
    readonly boothStore: BoothStore;
    readonly uiState: UIState;

    constructor() {
        this.categoryStore = new CategoryStore(this);
        this.exhibitorStore = new ExhibitorStore(this);
        this.boothStore = new BoothStore(this);
        this.uiState = new UIState(this);
    }

    @action clickBookmarks() {
        throw new Error('Not implemented');
    }

    @action moveToList() {
        throw new Error('Not implemented');
    }

    @action setSearchFocused(arg0: boolean) {
        throw new Error("Method not implemented.");
    }
    
    @action selectSearch() {
        throw new Error("Method not implemented.");
    }

    @action clickCategory(id: number) {
        throw new Error("Method not implemented.");
    }
}




