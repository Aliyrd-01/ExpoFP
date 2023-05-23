import { action, computed, observable } from "mobx";
import { uiState } from ".";
import Rect from "../core/Rect";
import Size from "../core/Size";
import settings from "../tools/settings";
import { remsToPixels } from "../utils";
import browser from "../utils/browser";
import { Booth, BoothBase, RegularBooth, SpecialBooth } from "./BoothStore";
import { Category } from "./CategoryStore";
import { Exhibitor } from "./ExhibitorStore";
import RootStore from "./RootStore";
import { Route } from "./RouteStore";
import { getResponsiveClass } from "../utils/responsiveClass";

// logger.log("Browser", browser.getBrowser());
//const isGoodBackdropBrowser = browser.satisfies({ safari: ">=13", chrome: ">=77" });

type ListType =
    | { type: "search"; text: string; focused: boolean }
    | { type: "bookmarks" }
    | { type: "category"; category: Category };
export type OverlaySize = "full" | "medium" | "small";
// export type ScreenSize = { width: number; height: number };
export type ListItem = Booth | Exhibitor | Category;

export default class UIState {
    private readonly rootStore: RootStore;

    @observable.struct list: ListType = { type: "search", text: "", focused: false };
    @observable.ref details: Booth | Exhibitor | Route = null;
    @observable.ref hoveredExhibitor: Exhibitor = null;
    @observable.ref hoveredBooth: Booth = null;
    // @observable.ref hoveredBooth1 = {};
    @observable zoomBy = null as number;
    @observable moveToBooths: Booth[] = null;
    @observable moveToRect: Rect = null;
    @observable moveToLocation = false;
    @observable menu = false;
    @observable searchFocused = false;
    @observable printingPdf = false;
    @observable largeMessage = null as string;
    @observable largeMessageLastSet = null as number;
    @observable.struct screenSize: Size;
    @observable desiredOverlaySize: OverlaySize;
    @observable overlayShowsAll = false;
    @observable centerMap = false;
    @observable zoomAfTransformK: number = 1;
    @observable activeListIndex = -1;
    @observable devicePixelRatio = window.devicePixelRatio;
    previewExhibitor: Exhibitor = null;
    @observable wsStarted = false;
    @observable canvasStarted = false;
    @observable kiosk = false;
    @observable inIdle = false;
    @observable modalActive = { share: false };
    @observable galleryActive = false;
    @observable hideOverlay = false;
    rootElement: HTMLDivElement;

    overlayMediumHeightRems = 10;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    @computed({ keepAlive: true }) get noOverlay() {
        return this.rootStore.fp.noOverlay || this.hideOverlay;
    }

    get onBoothClick() {
        return this.rootStore.fp.onBoothClick;
    }

    get onDirection() {
        return this.rootStore.fp.onDirection;
    }

    get onDetails() {
        return this.rootStore.fp.onDetails;
    }

    get onExhibitorCustomButtonClick() {
        return this.rootStore.fp.onExhibitorCustomButtonClick;
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

    @computed({ keepAlive: true }) get selectedRoute() {
        return this.details instanceof Route ? this.details : null;
    }

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
        if (!this.screenSize || this.screenSize.width > 550 || this.kiosk) return "left";
        return "bottom";
    }

    @computed get overlayCollapsed() {
        return (
            this.kiosk &&
            this.overlayPosition === "left" &&
            !this.searchFocused &&
            !this.menu &&
            !this.details &&
            !this.selectedCategory &&
            !this.selectedExhibitor &&
            this.list.type !== "bookmarks" &&
            !(this.list as any).text.length
        );
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
        return settings.EXPO === "cbresupplypartner" ? "bottom" : "top";
    }
    @computed get wsPosition() {
        return this.overlayBottom ? "top" : this.wsDesktopPosition;
    }
    @computed get responsiveClass() {
        return getResponsiveClass(this.screenSize.width);
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
    @computed get canvasVisibleRectPx(): Rect {
        const s = this.screenSize;
        return Rect.fromX1y1x2y2(
            uiState.kiosk ? 0 : this.mapVisibleLeft,
            this.mapVisibleTop,
            s.width,
            s.height - this.mapVisibleBottom
        );
    }

    @computed get canvasVisibleRectPt(): Rect {
        return this.canvasVisibleRectPx.scale(this.devicePixelRatio);
    }

    @computed get canvasSizePt(): Size {
        return this.screenSize.scale(this.devicePixelRatio);
    }

    // misc
    @computed({ keepAlive: true }) get shouldUseBackdrop() {
        if (uiState.overlayCollapsed) return false;
        if (localStorage.getItem("forcebackdrop") === "1") return true;
        if (this.overlayBottom) return false;
        if (this.selectedExhibitor?.leadingImageUrl && !this.selectedExhibitor?.leadingImageLinkUrl) return false;
        // if (settings.EXPO !== "aweusa2020" && settings.EXPO !== "expo") return false;
        // const ua = navigator.userAgent;
        // const isWebkit = ua.indexOf("AppleWebKit") !== -1 && ua.indexOf("Edge/") === -1;
        // const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
        const isSafari = browser.satisfies({ safari: ">=13" });
        const isChrome = browser.satisfies({ chrome: ">=77" });
        var isAndroid = /(android)/i.test(navigator.userAgent);
        if (isAndroid) return false;
        return isSafari || (isChrome && uiState.canvasSizePt.height * uiState.canvasSizePt.width < 3000000);
    }

    ///////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////
    // filtering
    @computed get dimmed() {
        const exhibitors = this.rootStore.exhibitorStore.exhibitors;
        const specialBooths = this.rootStore.boothStore.booths.filter((b) => b instanceof SpecialBooth);

        return (
            exhibitors.length &&
            (this.listItems.length !== [...exhibitors, ...specialBooths].length ||
                this.listItems.find((x) => !(x instanceof Exhibitor) && !(x instanceof SpecialBooth)))
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

        if (!text) {
            const otherSpacesArray = boothsArray.filter((b) => b instanceof SpecialBooth);
            const combinedArray = [...exhibitorsArray, ...otherSpacesArray];

            return exhibitorsArray.length === 0
                ? boothsArray
                : combinedArray.sort((a, b) => {
                      const aFeatured = a instanceof Exhibitor && a.featured !== undefined;
                      const bFeatured = b instanceof Exhibitor && b.featured !== undefined;

                      if (aFeatured !== bFeatured) {
                          return aFeatured ? -1 : 1;
                      }

                      const aDisplayName = a instanceof SpecialBooth && a.title ? a.title : a.name;
                      const bDisplayName = b instanceof SpecialBooth && b.title ? b.title : b.name;

                      return aDisplayName.localeCompare(bDisplayName, undefined, { sensitivity: "base" });
                  });
        }
        if (text === "testerror") throw new Error("Test error");
        if (text === "2testerror") {
            window.setTimeout(() => {
                throw new Error("Test error");
            }, 1000);
        }

        let items: ListItem[] = [];

        // rulles here
        const matchingExhibitors = exhibitorsArray.filter(
            (e) => e.name.toLowerCase().indexOf(text.toLowerCase()) !== -1 || e.booths.find((b) => b.name.toLowerCase() === text)
        );
        const matchingCategories = categoriesArray.filter((e) => e.name.toLowerCase().indexOf(text.toLowerCase()) !== -1);
        const matchingBooths = boothsArray.filter(
            (e) =>
                (!(e instanceof RegularBooth) || !matchingExhibitors.find((x) => x.booths.indexOf(e) !== -1)) &&
                (e.title || e.name).toLowerCase().indexOf(text.toLowerCase()) !== -1
        );

        items.push(...matchingExhibitors);
        items.push(...matchingCategories);
        items.push(...matchingBooths);

        return items;
    }

    @computed get listItems(): ListItem[] {
        if (this.details instanceof Route && this.details.from && this.details.to) return [this.details.from, this.details.to];

        switch (this.list.type) {
            case "search":
                return this.searchItems;
            case "bookmarks":
                return this.rootStore.exhibitorStore.bookmarked;
            case "category":
                return this.list.category.exhibitors;
        }
        throw new Error("Unknown list.type");
    }

    @computed({ keepAlive: true }) get listBooths() {
        const arr = [] as Booth[];
        this.listItems.forEach((item) => {
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
        let arr: Booth[] = [];
        if (this.selectedExhibitor) arr = this.selectedExhibitor.booths;
        else if (this.selectedBooth) arr = [this.selectedBooth];

        const route = this.selectedRoute;

        if (route?.from) arr.push(route.from);
        if (route?.to) arr.push(route.to);

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
