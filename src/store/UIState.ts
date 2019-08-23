import { action, computed, observable } from "mobx";
import { remsToPixels } from "../utils";
import { Booth, BoothBase, RegularBooth } from "./BoothStore";
import { Category } from "./CategoryStore";
import { Exhibitor } from "./ExhibitorStore";
import RootStore from "./RootStore";

type ListType =
    | { type: "search"; text: string; focused: boolean }
    | { type: "bookmarks" }
    | { type: "category"; category: Category };
export type OverlaySize = "full" | "medium" | "small";
export type ScreenSize = { width: number; height: number };
export type ListItem = Booth | Exhibitor | Category;

export default class UIState {
    private readonly rootStore: RootStore;

    @observable.struct list: ListType = { type: "search", text: "", focused: false };
    @observable.ref details: Booth | Exhibitor = null;
    @observable.ref hoveredExhibitor: Exhibitor = null;
    @observable.ref hoveredBooth: Booth = null;
    // @observable.ref hoveredBooth1 = {};
    
    @observable zoomBy = null as number;
    @observable moveToBooths: Booth[] = null;
    @observable menu = false;
    @observable searchFocused = false;
    @observable printingPdf = false;
    @observable.struct screenSize: ScreenSize;
    @observable desiredOverlaySize: OverlaySize = "medium";
    @observable overlayShowsAll = false;
    @observable centerMap = false;
    @observable activeListIndex = -1;
    @observable devicePixelRatio = window.devicePixelRatio;
    previewExhibitor: Exhibitor = null;

    overlayMediumHeightRems = 10;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    @computed({ keepAlive: true }) get selectedExhibitor() {
        return this.details instanceof Exhibitor ? this.details : null;
    }

    @computed({ keepAlive: true }) get selectedBooth() {
        return this.details instanceof BoothBase ? this.details : null;
    }

    @computed({ keepAlive: true }) get selectedCategory() {
        return this.list.type === "category" ? this.list.category : null;
    }

    ///////////////////////////////////////////////////////////////////////////
    // positions
    @computed get overlayPosition() {
        if (!this.screenSize || this.screenSize.width > 550) return "left";
        return "bottom";
    }
    @computed get overlaySize(): OverlaySize {
        if (this.overlayLeft) return "full";
        return this.desiredOverlaySize;
    }
    @computed get overlayBottom() {
        return this.overlayPosition === "bottom";
    }
    @computed get overlayLeft() {
        return this.overlayPosition === "left";
    }
    @computed get overlayWidthPx() {
        return this.overlayLeft ? remsToPixels(23.5) : remsToPixels(this.screenSize.width);
    }
    @computed get wsWidthPx() {
        return this.overlayLeft ? this.screenSize.width - this.overlayWidthPx : this.screenSize.width;
    }
    @computed get wsImageHeightPx() {
        return remsToPixels(3);
    }
    @computed get wsPaddingPx() {
        return remsToPixels(0.3);
    }
    @computed get wsOccupiedHeightPx() {
        return this.wsShown ? this.wsImageHeightPx + this.wsPaddingPx * 2 : 0;
    }
    @computed get wsShown() {
        // TODO: RESTORE
        return false; //this.advertisedExhibitors.length > 0;
    }

    @computed get wsDesktopPosition() {
        return process.env.REACT_APP_EFP_EXPO === "cbresupplypartner" ? "bottom" : "top";
    }
    @computed get wsPosition() {
        return this.overlayBottom ? "top" : this.wsDesktopPosition;
    }
    // map
    @computed get mapVisibleTop() {
        return this.wsPosition === "top" ? this.wsOccupiedHeightPx : 0;
    }
    @computed get mapVisibleBottom() {
        if (this.overlayLeft) {
            return this.wsPosition === "bottom" ? this.wsOccupiedHeightPx : 0;
        }
        return remsToPixels(this.overlayMediumHeightRems);
    }
    @computed get mapVisibleLeft() {
        return this.overlayLeft ? this.overlayWidthPx : 0;
    }
    ///////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////
    // filtering
    @computed get dimmed() {
        return (
            this.listItems.length !== this.rootStore.exhibitorStore.exhibitors.length ||
            this.listItems.find(x => !(x instanceof Exhibitor))
        );
    }
    @computed get searchItems(): (ListItem)[] {
        if (this.list.type !== "search") return [];
        let text = this.list.text.trim().toLowerCase() as string;
        // let words = text.split(/\s+/).filter(x => x);

        const { exhibitorStore, categoryStore, boothStore } = this.rootStore;

        const exhibitorsArray = exhibitorStore.exhibitors;
        const categoriesArray = categoryStore.categories;
        const boothsArray = boothStore.booths;

        if (!text) return exhibitorsArray;
        if (text === "testerror") throw new Error("Test error");
        if (text === "2testerror") {
            window.setTimeout(() => {
                throw new Error("Test error");
            }, 1000);
        }

        let items: (ListItem)[] = [];

        // rulles here
        const matchingExhibitors = exhibitorsArray.filter(
            e => e.name.toLowerCase().indexOf(text.toLowerCase()) !== -1 || e.booths.find(b => b.name.toLowerCase() === text)
        );
        const matchingCategories = categoriesArray.filter(e => e.name.toLowerCase().indexOf(text.toLowerCase()) !== -1);
        const matchingBooths = boothsArray.filter(
            e =>
                (!(e instanceof RegularBooth) || !matchingExhibitors.find(x => x.booths.indexOf(e) !== -1)) &&
                e.name.toLowerCase().indexOf(text.toLowerCase()) !== -1
        );

        items.push(...matchingExhibitors);
        items.push(...matchingCategories);
        items.push(...matchingBooths);

        return items;
    }

    @computed get listItems(): (ListItem)[] {
        switch (this.list.type) {
            case "search":
                return this.searchItems;
            case "bookmarks":
                return this.rootStore.exhibitorStore.bookmarked;
            case "category":
                return this.rootStore.categoryStore.categories;
        }
        throw new Error("Unknown list.type");
    }

    @computed({ keepAlive: true }) get listBooths() {
        const arr = [] as Booth[];
        this.listItems.forEach(item => {
            if (item instanceof Exhibitor) {
                arr.push(...item.booths);
            } else if (item instanceof BoothBase) {
                arr.push(item as Booth);
            }
        });
        return new Set(arr);
    }
    // @computed get listBoothsIdsSet() {
    //     return new Set(getters.listBoothsIds);
    // }
    @computed({ keepAlive: true }) get selectedBooths() {
        let arr: Booth[];
        if (this.selectedExhibitor) arr = this.selectedExhibitor.booths;
        else if (this.selectedBooth) arr = [this.selectedBooth];
        return new Set(arr);
    }
    // @computed get selectedBoothIdsSet() {
    //     return new Set(getters.selectedBoothIds);
    // }
    @computed({ keepAlive: true }) get hoveredBooths() {
        let arr: Booth[];
        if (this.hoveredBooth) arr = [this.hoveredBooth];
        else if (this.hoveredExhibitor) arr = this.hoveredExhibitor.booths;
        return new Set(arr);
    }

    ///////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////
    // actions TODO: move all to root store?
    @action toggleMapOverlay() {
        if (this.overlayPosition === "bottom" && this.overlaySize === "full") this.desiredOverlaySize = "medium";
        else if (this.overlayPosition === "bottom" && this.overlaySize !== "full") this.desiredOverlaySize = "full";
    }

    ///////////////////////////////////////////////////////////////////////////
}
