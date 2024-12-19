import { action, computed, observable } from "mobx";
import { boothStore, exhibitorStore, uiState } from ".";
import { PREVIEW_MODE_STORAGE_KEY, VISIBILITY_STORAGE_KEY } from "../constants";
import Rect from "../core/Rect";
import Size from "../core/Size";
import data from "../data";
import { svgArea } from "../data/svg";
import { hasUserConsent } from "../tools/gtag";
import settings from "../tools/settings";
import { remsToPixels } from "../utils";
import browser from "../utils/browser";
import { getLanguage } from "../utils/i18n";
import { isLocalStorageAvailable } from "../utils/localStorage";
import { getResponsiveClass } from "../utils/responsiveClass";
import { Booth, BoothBase, RegularBooth, SpecialBooth } from "./BoothStore";
import { Category } from "./CategoryStore";
import { Exhibitor } from "./ExhibitorStore";
import RootStore from "./RootStore";
import { Route } from "./RouteStore";
import { ScheduleItem } from "./ScheduleStore";
import type { ListItem, ListType, OverlaySize, Visibility } from "./types";
import { sanitizeStr } from "../utils/sanitizeText";

// logger.log("Browser", browser.getBrowser());
//const isGoodBackdropBrowser = browser.satisfies({ safari: ">=13", chrome: ">=77" });

export default class UIState {
    private readonly rootStore: RootStore;

    @observable.struct list: ListType = { type: "search", text: "", focused: false };
    @observable.ref details: Booth | Exhibitor | Route | Category = null;
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
    @observable hideCookieConsent = Boolean(hasUserConsent());
    @observable hideHeaderLogo = false;
    @observable hideLogoInBooth = false;
    @observable disableBookmarked = false;
    @observable hideLanguage = false;
    @observable disableGps = false;
    @observable monochrome = false;
    @observable heatmap = false;
    @observable rtl = getLanguage() === "ar" || getLanguage() === "he";
    rootElement: HTMLDivElement;
    @observable debugCircles: { x: number; y: number; radius: number; color?: string }[] = [];
    @observable mapControlsHidden = false;
    @observable floorsControlHidden = false;
    @observable hideFreeOrDemo = false;

    @computed get highlightedBooths() {
        const externalIsSet = new Set(this.rootStore.exhibitorStore.highlightedByExternalIds);

        const booths = new Set<string>(
            this.rootStore.exhibitorStore.exhibitors
                .filter(e => externalIsSet.has(e.externalId))
                .flatMap(e => e.booths.filter(b => b instanceof RegularBooth))
                .map(b => b.id.toString())
        );

        const isSearch = this.list?.type === "search" && this.list?.text?.trim().length;
        if (isSearch) {
            this.listBooths.forEach(b => booths.add(b.id.toString()));
        }

        if (this.list?.type === "filter") {
            (this.list.items as Exhibitor[])
                .flatMap(e => e.booths.filter(b => b instanceof RegularBooth))
                .forEach(b => booths.add(b.id.toString()));
        }

        if (this.list?.type === "category") {
            this.list.category.exhibitors
                .flatMap(e => e.booths.filter(b => b instanceof RegularBooth))
                .forEach(b => booths.add(b.id.toString()));
        }

        if (this.details instanceof Route) {
            booths.clear();
            booths.add(this.details.from?.id.toString());
            booths.add(this.details.to?.id.toString());
        }

        const hasNoSearchResult = (isSearch && !this.listBooths.size);

        if (this.details instanceof RegularBooth && (hasNoSearchResult || booths.size)) {
            booths.add(this.details.id.toString());
        }

        if (this.details instanceof Exhibitor && (hasNoSearchResult || booths.size)) {
            this.details.booths.filter(b => b instanceof RegularBooth).forEach(b => booths.add(b.id.toString()));
        }

        booths.delete(undefined);
        booths.delete(null);

        return booths;
    }

    overlayMediumHeightRems = 10;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    @computed({ keepAlive: true }) get noOverlay() {
        return this.rootStore.fp.noOverlay || this.hideOverlay;
    }

    @computed({ keepAlive: true }) get gpsEnabled() {
        return data.autoTrackingGps && !this.disableGps && !data.enableIPS;
    }

    get onBoothClick() {
        return this.rootStore.fp.onBoothClick;
    }

    get onMarkerClick() {
        return this.rootStore.fp.onMarkerClick;
    }

    get onBookmarkClick() {
        return this.rootStore.fp.onBookmarkClick;
    }

    get onCategoryClick() {
        return this.rootStore.fp.onCategoryClick;
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

    get onGetCoordsClick() {
        return this.rootStore.fp.onGetCoordsClick;
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
            this.list.type !== "language" &&
            !(this.list as any).text?.length
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

    @computed get kioskRectPadding() {
        return this.kiosk && this.overlayLeft && uiState.selectedRoute?.from && uiState.selectedRoute?.to
            ? (1.7 * uiState.overlayWidthPx) / uiState.wsWidthPx
            : 0;
    }

    @computed get wsOccupiedHeightPx() {
        return this.wsShown ? this.wsImageHeightPx + this.wsPaddingPx * 2 : 0;
    }

    @computed({ keepAlive: true }) get wsShown() {
        return !this.hideHeaderLogo && this.rootStore.exhibitorStore.advertised.length > 0;
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
        if (uiState.kiosk) return 0;
        return (this.wsPosition === "top" ? this.wsOccupiedHeightPx : 0) + this.headerHeightPx;
    }
    @computed get mapVisibleBottom() {
        if (this.overlayLeft || this.noOverlay) {
            return this.wsPosition === "bottom" ? this.wsOccupiedHeightPx : 0;
        }
        return remsToPixels(this.overlayMediumHeightRems);
    }
    @computed get mapVisibleStart() {
        return this.overlayLeft ? this.overlayWidthPx : 0;
    }
    @computed get mapVisibleLeft() {
        return this.overlayLeft ? this.overlayWidthPx : 0;
    }

    // visible rect
    @computed get canvasVisibleRectPx(): Rect {
        const s = this.screenSize;
        return Rect.fromX1y1x2y2(
            uiState.kiosk || uiState.rtl ? 0 : this.mapVisibleStart,
            this.mapVisibleTop,
            uiState.rtl ? s.width - this.mapVisibleStart : s.width,
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
        if (isLocalStorageAvailable && localStorage.getItem("forcebackdrop") === "1") return true;
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
        return (
            this.highlightedBooths.size > 0
            || (this.list?.type === "search" && this.list?.text?.trim().length > 0)
        );
    }

    @computed get searchItems(): ListItem[] {
        if (this.list.type !== "search") return [];
        let text = this.list.text.trim().toLowerCase() as string;
        // let words = text.split(/\s+/).filter(x => x);

        const { exhibitorStore, categoryStore, boothStore, scheduleStore, heatmapStore } = this.rootStore;

        const exhibitorsArray = exhibitorStore.exhibitors;
        const categoriesArray = categoryStore.categories.filter((c) => c.exhibitors.length);
        const boothsArray = boothStore.booths;
        const eventsArray = scheduleStore.scheduleItems;

        if (!text) {
            let combinedArray = [];
            const cats = data.showCategories ? categoriesArray : [];

            const otherSpacesArray = boothsArray.filter((b) => b instanceof SpecialBooth);

            if (data.showCompaniesAndBooths) combinedArray = combinedArray.concat(exhibitorsArray);
            if (data.showOtherSpaces) combinedArray = combinedArray.concat(otherSpacesArray);
            if (uiState.kiosk && settings.EXPO == "imexamerica23") combinedArray = combinedArray.slice(0, 300);

            if (this.heatmap) {
                const allItems = [...exhibitorsArray, ...boothsArray];
                return allItems.sort((a, b) => heatmapStore.getClicksByType(b) - heatmapStore.getClicksByType(a));
            }

            return exhibitorsArray.length === 0
                ? boothsArray
                : cats.concat(
                      combinedArray.sort((a, b) => {
                          const aFeatured = a instanceof Exhibitor && a.featured !== undefined;
                          const bFeatured = b instanceof Exhibitor && b.featured !== undefined;

                          if (aFeatured !== bFeatured) {
                              return aFeatured ? -1 : 1;
                          }

                          const aDisplayName = a instanceof SpecialBooth && a.title ? a.title : a.name;
                          const bDisplayName = b instanceof SpecialBooth && b.title ? b.title : b.name;

                          return aDisplayName.localeCompare(bDisplayName, undefined, { sensitivity: "base", numeric: true });
                      })
                  );
        }
        if (text === "testerror") throw new Error("Test error");
        if (text === "2testerror") {
            window.setTimeout(() => {
                throw new Error("Test error");
            }, 1000);
        }

        const items: ListItem[] = [];

        const matchingExhibitors = new Set<Exhibitor>();
        const matchingBooths = new Set<Booth>();
        const matchingCategories = new Set<Category>();
        const matchingEvents = new Set<ScheduleItem>();

        // a&b&foo=1&bar=2 => a&b
        const splittedTexts = [text.replace(/&[^&=]+=[^&]+/g, "")]; // text.split("&").filter((s) => s);

        function selectLettersSpacesNumbers(input: string): string {
            // Without & because of names that contain & (e.g. "A&B")
            return input?.replace(/[!@#$%^*-\.,\(\)\^#$%:?_+'"\/]/g, " ")?.replace(/\s\s+/g, " ") ?? input;
        }

        function containsIgnoreCase(str: string, searchTerm: string) {
            return selectLettersSpacesNumbers(str).toLowerCase().includes(selectLettersSpacesNumbers(searchTerm).toLowerCase());
        }

        function containsLevelIgnoreCase(str: string, searchTerm: string) {
            return !str
                ? false
                : containsIgnoreCase(str, searchTerm) || containsIgnoreCase(data.levelTerm + " " + str, searchTerm);
        }

        exhibitorsArray.forEach((e) => {
            if (
                splittedTexts.some(
                    (text) =>
                        containsIgnoreCase(e.name, text) ||
                        e.booths.some(
                            (b) =>
                                (!text && containsIgnoreCase(b.name, text)) ||
                                containsLevelIgnoreCase(b.layer?.name ?? null, text)
                        )
                )
            ) {
                matchingExhibitors.add(e);
            }
        });

        categoriesArray.forEach((c) => {
            if (splittedTexts.some((text) => containsIgnoreCase(c.name, text))) {
                matchingCategories.add(c);
            }
        });

        boothsArray.forEach((b) => {
            const addBoothCondition = this.heatmap
                ? true
                : !(b instanceof RegularBooth) || !Array.from(matchingExhibitors).find((x) => x.booths.includes(b));

            if (
                addBoothCondition &&
                splittedTexts.some(
                    (text) =>
                        containsIgnoreCase(b.title || "", text) ||
                        containsIgnoreCase(b.name, text) ||
                        containsIgnoreCase(b.fullName, text) ||
                        containsLevelIgnoreCase(b.layer?.name ?? null, text)
                )
            ) {
                matchingBooths.add(b);
            }
        });

        eventsArray.forEach((e) => {
            if (
                splittedTexts.some(
                    (text) => containsIgnoreCase(e.name || "", text) || containsIgnoreCase(e.description || "", text)
                )
            ) {
                matchingEvents.add(e);
            }
        });

        items.push(...matchingEvents);
        items.push(...matchingCategories);
        items.push(...matchingExhibitors);
        items.push(...matchingBooths);

        if (this.heatmap) {
            return items.sort((a, b) => heatmapStore.getClicksByType(b) - heatmapStore.getClicksByType(a));
        }

        const itemsMap = new Map(items.map(item => [item.id, item]));
        return items
            .map(item => {
                if (!item.name) return null;

                const lowerCaseName = sanitizeStr((
                    item instanceof BoothBase
                        ? (item.fullName.toLowerCase() || item.name.toLowerCase())
                        : item.name.toLowerCase()
                ));

                // Find the position of the first occurrence
                const position = lowerCaseName.indexOf(sanitizeStr(text));
                if (position === -1) return null;

                const result = { id: item.id, position, lowerCaseName, featured: false };
                if (item instanceof Exhibitor) {
                    result.featured = item.featured;
                }
                return result;
            })
            .filter(Boolean)
            // Sort by featured status (featured first), 
            // then by position, and finally lexicographically by name.
            .sort((a, b) => {
                if ((a.featured || b.featured) && (a.featured !== b.featured)) {
                    return a.featured ? -1 : 1;
                }

                if (a.position !== b.position) {
                    return a.position - b.position;
                }

                return (
                    a.lowerCaseName.localeCompare(b.lowerCaseName) ||
                    String(a.id).localeCompare(String(b.id)) // For stability
                );
            })
            .map(({ id }) => itemsMap.get(id));
    }

    @computed get listItems(): ListItem[] {
        if (this.details instanceof Route) return [this.details.from, this.details.to].filter((x) => x);

        switch (this.list.type) {
            case "search":
                return this.searchItems;
            case "bookmarks":
                return this.rootStore.exhibitorStore.bookmarked;
            case "category":
                return this.list.category.exhibitors;
            case "language":
                return this.rootStore.languageStore.languages;
            case "filter":
                return this.list.items;
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
            } else if (item instanceof ScheduleItem) {
                if (item.boothId) arr.push(boothStore.booths.find((b) => b.id === item.boothId));
                if (item.exhibitorId) arr.push(...exhibitorStore.exhibitors.find((e) => e.id === item.exhibitorId).booths);
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

    @computed get visibility(): Visibility {
        return {
            controls: !this.mapControlsHidden,
            levels: !this.floorsControlHidden,
            header: !this.hideHeaderLogo,
            overlay: !this.hideOverlay,
        };
    }

    @action setVisibility(visibility: Visibility) {
        const flags: Visibility = {
            ...Object.keys(this.visibility).reduce((acc, key) => ({ ...acc, [key]: true }), {}),

            ...Object.keys(visibility)
                .filter((k) => this.visibility.hasOwnProperty(k))
                .reduce((acc, key) => ({ ...acc, [key]: visibility[key] }), {}),
        };

        if (Object.values(flags).every(Boolean)) {
            isLocalStorageAvailable && localStorage.removeItem(VISIBILITY_STORAGE_KEY);
        } else {
            isLocalStorageAvailable && localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(flags));
        }

        this.mapControlsHidden = !flags.controls;
        this.floorsControlHidden = !flags.levels;
        this.hideHeaderLogo = !flags.header;
        this.hideFreeOrDemo = !flags.header;
        this.hideOverlay = !flags.overlay;
    }

    ///////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////
    // actions TODO: move all to root store?
    @action toggleMapOverlay() {
        if (this.overlayPosition === "bottom" && this.overlaySize === "full") this.desiredOverlaySize = "medium";
        else if (this.overlayPosition === "bottom" && this.overlaySize !== "full") this.desiredOverlaySize = "full";
    }

    @action resetRtl() {
        this.rtl = getLanguage() === "ar" || getLanguage() === "he";
    }

    @action changeZoom(zoom: number) {
        this.zoomBy = zoom;
    }

    @action zoomIn() {
        this.changeZoom(1.5);
    }

    @action zoomOut() {
        this.changeZoom(0.66);
    }

    @action fitBounds() {
        this.moveToRect = this.rootStore.layerStore.rectangle || svgArea;
    }

    get previewMode() {
        const previewMode = isLocalStorageAvailable && localStorage.getItem(PREVIEW_MODE_STORAGE_KEY) === "1";
        return previewMode || this.rootStore.fp.previewMode;
    }

    ///////////////////////////////////////////////////////////////////////////
}
