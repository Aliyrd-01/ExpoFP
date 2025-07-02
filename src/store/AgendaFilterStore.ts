import { action, computed, observable } from "mobx";
import RootStore from "./RootStore";
import BaseFilterStore from "./BaseFilterStore";
import { FilterItem } from "./types";

type DateFilter = "all" | "today" | "tomorrow";
type SortOrder = "asc" | "desc";

interface Filter<T> {
    value: T;
    pending: T;
}

interface AgendaFilterState {
    isOpen: boolean;
    selectedItems: FilterItem[];
    pendingItems: FilterItem[];
    searchText: string;
    filters: {
        date: Filter<DateFilter>;
        sortOrder: Filter<SortOrder>;
        use24hFormat: Filter<boolean>;
    };
}

export default class AgendaFilterStore extends BaseFilterStore {
    @observable state: AgendaFilterState = {
        isOpen: false,
        selectedItems: [],
        pendingItems: [],
        searchText: "",
        filters: {
            date: { value: "all", pending: "all" },
            sortOrder: { value: "desc", pending: "desc" },
            use24hFormat: { value: false, pending: false },
        },
    };

    constructor(rootStore: RootStore) {
        super(rootStore);
    }

    @action
    setSearchText(text: string) {
        this.state.searchText = text;
    }

    @action
    setPending<K extends keyof AgendaFilterState["filters"]>(key: K, value: AgendaFilterState["filters"][K]["value"]) {
        this.state.filters[key].pending = value;
    }

    @action
    applyFilters() {
        const { filters } = this.state;
        filters.date.value = filters.date.pending;
        filters.sortOrder.value = filters.sortOrder.pending;
        filters.use24hFormat.value = filters.use24hFormat.pending;

        this.state.selectedItems = [...this.state.pendingItems];
        this.state.isOpen = false;
        this.updateUIState();
    }

    @action
    resetFilters() {
        const defaults = this.getDefaultValues();
        const { filters } = this.state;

        filters.date.pending = defaults.date;
        filters.sortOrder.pending = defaults.sortOrder;
        filters.use24hFormat.pending = defaults.use24hFormat;

        this.state.pendingItems = [];
        this.state.searchText = "";
    }

    @action
    resetAndApplyFilters() {
        const defaults = this.getDefaultValues();
        const { filters } = this.state;

        filters.date.value = defaults.date;
        filters.date.pending = defaults.date;

        filters.sortOrder.value = defaults.sortOrder;
        filters.sortOrder.pending = defaults.sortOrder;

        filters.use24hFormat.value = defaults.use24hFormat;
        filters.use24hFormat.pending = defaults.use24hFormat;

        this.state.selectedItems = [];
        this.state.pendingItems = [];
        this.state.searchText = "";
        this.state.isOpen = false;
        this.rootStore.uiState.list = { type: "agenda" };
    }

    @action
    openFilter() {
        this.state.isOpen = true;
        this.state.pendingItems = [...this.state.selectedItems];

        const { filters } = this.state;
        filters.date.pending = filters.date.value;
        filters.sortOrder.pending = filters.sortOrder.value;
        filters.use24hFormat.pending = filters.use24hFormat.value;
    }

    @action
    closeFilter() {
        this.state.isOpen = false;
        this.state.pendingItems = [...this.state.selectedItems];

        const { filters } = this.state;
        filters.date.pending = filters.date.value;
        filters.sortOrder.pending = filters.sortOrder.value;
        filters.use24hFormat.pending = filters.use24hFormat.value;
    }

    @computed
    get activeFiltersCount(): number {
        const { filters } = this.state;
        let count = 0;

        if (filters.date.value !== "all") count++;
        if (filters.sortOrder.value !== "desc") count++;
        if (filters.use24hFormat.value) count++;

        return count;
    }

    protected updateUIState(): void {
        this.rootStore.uiState.list = { type: "agenda" };
    }

    getFilteredItems(): FilterItem[] {
        return [];
    }

    private getDefaultValues() {
        return {
            date: "all" as DateFilter,
            sortOrder: "desc" as SortOrder,
            use24hFormat: false,
        };
    }
}
