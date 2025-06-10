import { action, computed, observable } from "mobx";
import RootStore from "./RootStore";
import BaseFilterStore from "./BaseFilterStore";
import { FilterItem } from "./types";

interface AgendaFilterState {
    dateFilter: "all" | "today" | "tomorrow";
    sortOrder: "asc" | "desc";
    isOpen: boolean;
    selectedItems: FilterItem[];
    pendingItems: FilterItem[];
    pendingDateFilter: "all" | "today" | "tomorrow";
    pendingSortOrder: "asc" | "desc";
}

export default class AgendaFilterStore extends BaseFilterStore {
    @observable state: AgendaFilterState = {
        dateFilter: "all",
        sortOrder: "desc",
        isOpen: false,
        selectedItems: [],
        pendingItems: [],
        pendingDateFilter: "all",
        pendingSortOrder: "desc",
    };

    constructor(rootStore: RootStore) {
        super(rootStore);
    }

    @action
    setDateFilter(filter: "all" | "today" | "tomorrow") {
        this.state.pendingDateFilter = filter;
    }

    @action
    setSortOrder(order: "asc" | "desc") {
        this.state.pendingSortOrder = order;
    }

    @computed
    get activeFiltersCount(): number {
        let count = 0;
        if (this.state.dateFilter !== "all") count++;
        if (this.state.sortOrder !== "desc") count++;
        return count;
    }

    @action
    resetFilter() {
        this.state.pendingDateFilter = "all";
        this.state.pendingSortOrder = "desc";
        this.state.pendingItems = [];
    }

    @action
    applyFilter() {
        this.state.selectedItems = [...this.state.pendingItems];
        this.state.dateFilter = this.state.pendingDateFilter;
        this.state.sortOrder = this.state.pendingSortOrder;
        this.closeFilter();
        this.updateUIState();
    }

    @action
    openFilter() {
        this.state.isOpen = true;
        this.state.pendingItems = [...this.state.selectedItems];
        this.state.pendingDateFilter = this.state.dateFilter;
        this.state.pendingSortOrder = this.state.sortOrder;
    }

    protected updateUIState(): void {
        this.rootStore.uiState.list = { type: "agenda" };
    }

    getFilteredItems(): FilterItem[] {
        return [];
    }
}
