import { action, computed, observable } from "mobx";
import RootStore from "./RootStore";
import { FilterItem, FilterState, FilterStore } from "./types";

export default abstract class BaseFilterStore implements FilterStore {
    protected readonly rootStore: RootStore;

    @observable state: FilterState = {
        isOpen: false,
        selectedItems: [],
        pendingItems: [],
    };

    get publicRootStore() {
        return this.rootStore;
    }

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    @action openFilter() {
        this.state.isOpen = true;
        this.state.pendingItems = [...this.state.selectedItems];
    }

    @action closeFilter() {
        this.state.isOpen = false;
        this.state.pendingItems = [];
    }

    @action applyFilter() {
        this.state.selectedItems = [...this.state.pendingItems];
        this.closeFilter();
        this.updateUIState();
    }

    @action resetFilter() {
        this.state.pendingItems = [];
    }

    @action setPendingItems(items: FilterItem[]) {
        this.state.pendingItems = items;
    }

    protected abstract updateUIState(): void;
    abstract getFilteredItems(): any[];
}
