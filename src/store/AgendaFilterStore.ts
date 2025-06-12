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
    use24hFormat: boolean;
    pendingUse24hFormat: boolean;
}

export default class AgendaFilterStore extends BaseFilterStore {
    @observable state: AgendaFilterState = {
        isOpen: false,
        selectedItems: [],
        pendingItems: [],
        dateFilter: "all",
        sortOrder: "desc",
        pendingDateFilter: "all",
        pendingSortOrder: "desc",
        use24hFormat: false,
        pendingUse24hFormat: false
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

    @action
    setUse24hFormat(value: boolean) {
        this.state.pendingUse24hFormat = value;
    }

    @computed
    get activeFiltersCount() {
        let count = 0;
        if (this.state.dateFilter !== "all") count++;
        if (this.state.sortOrder !== "desc") count++;
        if (this.state.use24hFormat) count++;
        return count;
    }

    @action
    resetFilter() {
        this.state.pendingItems = [];
        this.state.selectedItems = [];
        this.state.pendingDateFilter = "all";
        this.state.pendingSortOrder = "desc";
        this.state.pendingUse24hFormat = false;
        this.state.dateFilter = "all";
        this.state.sortOrder = "desc";
        this.state.use24hFormat = false;
        this.rootStore.uiState.list = { type: "agenda" };
    }

    @action
    applyFilter() {
        this.state.selectedItems = [...this.state.pendingItems];
        this.state.dateFilter = this.state.pendingDateFilter;
        this.state.sortOrder = this.state.pendingSortOrder;
        this.state.use24hFormat = this.state.pendingUse24hFormat;
        this.state.isOpen = false;
        this.updateUIState();
    }

    @action
    openFilter() {
        this.state.isOpen = true;
        this.state.pendingItems = [...this.state.selectedItems];
        this.state.pendingDateFilter = this.state.dateFilter;
        this.state.pendingSortOrder = this.state.sortOrder;
        this.state.pendingUse24hFormat = this.state.use24hFormat;
    }

    @action
    closeFilter() {
        this.state.isOpen = false;
        this.state.pendingDateFilter = this.state.dateFilter;
        this.state.pendingSortOrder = this.state.sortOrder;
        this.state.pendingUse24hFormat = this.state.use24hFormat;
        this.state.pendingItems = [...this.state.selectedItems];
    }

    protected updateUIState(): void {
        this.rootStore.uiState.list = { type: "agenda" };
    }

    getFilteredItems(): FilterItem[] {
        return [];
    }
}
