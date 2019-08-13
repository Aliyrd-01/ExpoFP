import { action } from "mobx";
import BoothStore, { Booth } from "./BoothStore";
import CategoryStore, { Category } from "./CategoryStore";
import ExhibitorStore, { Exhibitor } from "./ExhibitorStore";
import UIState from "./UIState";

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

    @action selectExhibitor(exhibitor: Exhibitor) {
        this.uiState.hoveredExhibitor = exhibitor;
        this.uiState.details = exhibitor;
    }

    @action selectBooth(booth: Booth) {
        this.uiState.details = booth;
    }

    @action selectNone() {
        this.uiState.details = null;
    }

    @action selectBookmarks() {
        this.uiState.details = null;
        this.uiState.list = { type: "bookmarks" };
    }

    @action selectCategory(category: Category) {
        this.uiState.details = null;
        this.uiState.list = { type: "category", category };
        this.uiState.overlaySize = "full";
    }

    @action selectSearch(text?: string) {
        this.uiState.details = null;
        this.uiState.list = { type: "search", text: text || "", focused: false };
        this.uiState.activeListIndex = -1;
    }

    @action clickBookmarks() {
        throw new Error("Not implemented");
    }

    @action clickExhibitor(exhibitor: Exhibitor) {
        throw new Error("Not implemented");
    }

    @action moveToList() {
        throw new Error("Not implemented");
    }

    @action setSearchFocused(arg0: boolean) {
        throw new Error("Method not implemented.");
    }

    @action clickCategory(category: Category) {
        throw new Error("Method not implemented.");
    }

    @action openActiveListItem() {
        throw new Error("Method not implemented.");
    }

    @action changeActiveListIndex(delta: number) {
        throw new Error("Method not implemented.");
    }
}
