import { action, computed, observable } from "mobx";
import { Booth, BoothBase, BoothStateProvider, RegularBooth } from "../core/Booth";
// import { uiState } from ".";
import Rect from "../core/Rect";
import Size from "../core/Size";
// import settings from "../tools/settings";
import { remsToPixels } from "../utils";
import browser from "../utils/browser";
// import { Booth, BoothBase, RegularBooth } from "./BoothStore";
import { Category } from "./CategoryStore";
import { Exhibitor } from "./ExhibitorStore";
import RootStore from "./RootStore";

// logger.log("Browser", browser.getBrowser());
//const isGoodBackdropBrowser = browser.satisfies({ safari: ">=13", chrome: ">=77" });

type ListType =
    | { type: "search"; text: string; focused: boolean }
    | { type: "bookmarks" }
    | { type: "category"; category: Category };
export type OverlaySize = "full" | "medium" | "small";
// export type ScreenSize = { width: number; height: number };
export type ListItem = Booth | Exhibitor | Category;

export default class UIState implements BoothStateProvider {
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
    @observable largeMessage = null as string;
    @observable largeMessageLastSet = null as number;
    @observable.struct screenSize: Size;
    @observable desiredOverlaySize: OverlaySize;
    @observable overlayShowsAll = false;
    @observable centerMap = false;
    @observable activeListIndex = -1;
    @observable devicePixelRatio = window.devicePixelRatio;
    previewExhibitor: Exhibitor = null;
    @observable wsStarted = false;
    @observable canvasStarted = false;
    @observable showAdminUi = false;

    overlayMediumHeightRems = 10;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    get noOverlay() {
        return this.rootStore.fp.noOverlay;
    }

    get onBoothClick() {
        return this.rootStore.fp.onBoothClick;
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

    // @computed({ keepAlive: true }) get showAdminUi() {
    //     return true;
    // }

    ///////////////////////////////////////////////////////////////////////////
    // positions
    @computed get headerHeightRem() {
        return 0;
        // return 4;
    }

    @computed get headerHeightPx() {
        return remsToPixels(this.headerHeightRem);
    }

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
        return this.noOverlay ? 0 : this.overlayLeft ? remsToPixels(23.5) : remsToPixels(this.screenSize.width);
    }
    @computed get wsWidthPx() {
        return this.overlayLeft ? this.screenSize.width - this.overlayWidthPx : this.screenSize.width;
    }
    @computed({ keepAlive: true }) get wsImageHeightPx() {
        return remsToPixels(3);
    }
    @computed get wsPaddingPx() {
        return remsToPixels(0.3);
    }
    @computed get wsOccupiedHeightPx() {
        return this.wsShown ? this.wsImageHeightPx + this.wsPaddingPx * 2 : 0;
    }

    @computed({ keepAlive: true }) get wsShown() {
        return this.rootStore.exhibitorStore.advertised.length > 0;
    }

    @computed get wsDesktopPosition() {
        return "top"; //settings.EXPO === "cbresupplypartner" ? "bottom" : "top";
    }
    @computed get wsPosition() {
        return this.overlayBottom ? "top" : this.wsDesktopPosition;
    }

    // map
    @computed get mapVisibleTop() {
        return (this.wsPosition === "top" ? this.wsOccupiedHeightPx : 0) + this.headerHeightPx;
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

    // visible rect
    @computed({ keepAlive: true }) get canvasVisibleRectPx(): Rect {
        const s = this.screenSize;
        return Rect.fromX1y1x2y2(this.mapVisibleLeft, this.mapVisibleTop, s.width, s.height - this.mapVisibleBottom);
    }

    @computed({ keepAlive: true }) get canvasVisibleRectPt(): Rect {
        return this.canvasVisibleRectPx.scale(this.devicePixelRatio);
    }

    @computed({ keepAlive: true }) get canvasSizePt(): Size {
        return this.screenSize.scale(this.devicePixelRatio);
    }

    // misc
    @computed({ keepAlive: true }) get shouldUseBackdrop() {
        if (localStorage.getItem("forcebackdrop") === "1") return true;
        if (this.overlayBottom) return false;
        // if (settings.EXPO !== "aweusa2020" && settings.EXPO !== "expo") return false;
        // const ua = navigator.userAgent;
        // const isWebkit = ua.indexOf("AppleWebKit") !== -1 && ua.indexOf("Edge/") === -1;
        // const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
        const isAndroid = browser.getOSName(true) === "android";
        // TODO: test
        if (isAndroid) return false;

        const isSafari = browser.satisfies({ safari: ">=13" });
        const isChrome = browser.satisfies({ chrome: ">=77" });
        return isSafari || (isChrome && this.canvasSizePt.height * this.canvasSizePt.width < 3000000);
    }

    ///////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////
    // filtering
    @computed get dimmed() {
        return (
            this.listItems.length !== this.rootStore.exhibitorStore.exhibitors.length ||
            !!this.listItems.find(x => !(x instanceof Exhibitor))
        );
    }

    @computed get searchItems(): ListItem[] {
        if (this.list.type !== "search") return [];
        let text = this.list.text.trim().toLowerCase() as string;
        // let words = text.split(/\s+/).filter(x => x);

        const { exhibitorStore, categoryStore, boothStore } = this.rootStore;

        const exhibitorsArray = exhibitorStore.exhibitors;
        const categoriesArray = categoryStore.categories;
        const boothsArray = boothStore.booths;

        if (!text) return exhibitorsArray.length === 0 ? boothsArray : exhibitorsArray;
        if (text === "testerror") throw new Error("Test error");
        if (text === "2testerror") {
            window.setTimeout(() => {
                throw new Error("Test error");
            }, 1000);
        }

        let items: ListItem[] = [];

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

    @computed get listItems(): ListItem[] {
        switch (this.list.type) {
            case "search":
                return this.searchItems;
            case "bookmarks":
                return this.rootStore.exhibitorStore.bookmarkedObj;
            case "category":
                return this.list.category.exhibitors;
        }
        throw new Error("Unknown list.type");
    }

    @computed({ keepAlive: true }) get listBooths() {
        const arr: string[] = [];
        this.listItems.forEach(item => {
            if (item instanceof Exhibitor) {
                arr.push(...item.booths.map(x => x.name));
            } else if (item instanceof BoothBase) {
                arr.push((item as Booth).name);
            }
        });
        return new Set(arr);
    }
    // @computed get listBoothsIdsSet() {
    //     return new Set(getters.listBoothsIds);
    // }
    @computed({ keepAlive: true }) get selectedBooths() {
        let arr: string[];
        if (this.selectedExhibitor) arr = this.selectedExhibitor.booths.map(x => x.name);
        else if (this.selectedBooth) arr = [this.selectedBooth.name];
        return new Set(arr);
    }
    // @computed get selectedBoothIdsSet() {
    //     return new Set(getters.selectedBoothIds);
    // }
    @computed({ keepAlive: true }) get hoveredBooths() {
        let arr: string[];
        if (this.hoveredBooth) arr = [this.hoveredBooth.name];
        else if (this.hoveredExhibitor) arr = this.hoveredExhibitor.booths.map(x => x.name);
        return new Set(arr);
    }

    @computed({ keepAlive: true }) get bookmarkedBooths() {
        return this.rootStore.exhibitorStore.bookmarkedBooths;
    }

    @computed({ keepAlive: true }) get boothExhibitors() {
        return this.rootStore.boothStore.boothExhibitors;
    }

    @computed({ keepAlive: true }) get exhibitorById() {
        return this.rootStore.exhibitorStore.exhibitorById;
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
