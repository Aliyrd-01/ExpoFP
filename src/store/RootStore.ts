import CategoryStore from './CategoryStore';
import UIState from './UIState';
import ExhibitorStore from './ExhibitorStore';
import BoothStore from './BoothStore';

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
}




