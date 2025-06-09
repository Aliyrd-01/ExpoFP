import { computed, action } from "mobx";
import { Exhibitor } from "./ExhibitorStore";
import BaseFilterStore from "./BaseFilterStore";
import { FilterItem } from "./types";

export default class CategoryFilterStore extends BaseFilterStore {
    @computed get filteredExhibitors(): Exhibitor[] {
        if (this.state.selectedItems.length === 0) {
            return this.rootStore.exhibitorStore.exhibitors;
        }
        return this.rootStore.exhibitorStore.exhibitors.filter((exhibitor) =>
            this.state.selectedItems.some((category) => exhibitor.categories.some((c) => c.id === category.id))
        );
    }

    @computed get filteredBooths() {
        return this.rootStore.boothStore.booths.filter((booth) =>
            this.filteredExhibitors.some((exhibitor) => exhibitor.id === booth.exhibitors[0]?.id)
        );
    }

    get publicRootStore() {
        return this.rootStore;
    }

    updateUIState() {
        this.rootStore.uiState.menu = false;
        const selectedCategories = this.state.selectedItems
            .map((item) => this.rootStore.categoryStore.categories.find((cat) => cat.id === item.id))
            .filter(Boolean);
        this.rootStore.uiState.selectedCategoryFilters = selectedCategories;
        this.rootStore.uiState.categoryFilterOpen = true;
        this.rootStore.moveToList();
        this.rootStore.showMap();
    }

    getFilteredItems(): FilterItem[] {
        return this.rootStore.exhibitorStore.exhibitors.map((exhibitor) => ({
            id: exhibitor.id,
            name: exhibitor.name,
        }));
    }

    getMatchingExhibitorsCount(): number {
        if (this.state.pendingItems.length === 0) {
            return this.rootStore.exhibitorStore.exhibitors.length;
        }
        return this.rootStore.exhibitorStore.exhibitors.filter((exhibitor) =>
            exhibitor.categories.some((category) => this.state.pendingItems.some((pendingItem) => pendingItem.id === category.id))
        ).length;
    }

    @action resetFilter() {
        this.state.pendingItems = [];
        this.state.selectedItems = [];
        this.rootStore.uiState.selectedCategoryFilters = [];
        this.rootStore.uiState.categoryFilterOpen = false;
        this.rootStore.uiState.list = { type: "search", text: "", focused: false };
    }
}
