import CategoryStore from './CategoryStore';
import UIState from './UIState';
import ExhibitorStore from './ExhibitorStore';



export default class RootStore {
    readonly categoryStore: CategoryStore;
    readonly exhibitorStore: ExhibitorStore;
    readonly uiState: UIState;
    
    constructor() {
        this.categoryStore = new CategoryStore(this);
        this.exhibitorStore = new ExhibitorStore(this);
        this.uiState = new UIState(this);
    }
}




