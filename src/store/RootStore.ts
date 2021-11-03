import { action } from "mobx";
import FloorPlanReady from "../floorplan.ready";
import logger from "../tools/logger";
import { isWebGlSupported } from "../utils";
import BoothStore, { Booth, BoothBase, RegularBooth } from "./BoothStore";
import CategoryStore, { Category } from "./CategoryStore";
import ExhibitorStore, { Exhibitor } from "./ExhibitorStore";
import { default as RouteStore } from "./RouteStore";
import UIState, { ListItem } from "./UIState";

export default class RootStore {
    readonly categoryStore: CategoryStore;
    readonly exhibitorStore: ExhibitorStore;
    readonly boothStore: BoothStore;
    readonly uiState: UIState;
    readonly routeStore: RouteStore;
    fp: FloorPlanReady;

    constructor() {
        // this.fp = fp;
        this.categoryStore = new CategoryStore(this);
        this.exhibitorStore = new ExhibitorStore(this);
        this.boothStore = new BoothStore(this);
        this.routeStore = new RouteStore(this);
        this.uiState = new UIState(this);
    }

    @action selectExhibitor(exhibitor: Exhibitor) {
        // if (data.hideCompanies) return;
        this.uiState.hoveredExhibitor = null;
        this.uiState.details = exhibitor;
    }

    @action selectBooth(booth: Booth | Booth[]) {
        let b = Array.isArray(booth) ? booth : [booth];
        this.uiState.details = b[0];
        this.moveToList(b);
    }

    @action reset() {
        const el = window["__searchi"] as HTMLDivElement;
        if (
            el &&
            el.querySelector &&
            el.querySelector("input[type=search]") &&
            (el.querySelector("input[type=search]") as any).blur
        )
            (el.querySelector("input[type=search]") as any).blur();
        window.setTimeout(() => {
            this.selectSearch("");
            // this.moveToList();
            this.uiState.centerMap = true;
        }, 1000);
    }

    @action selectNone() {
        if (window["__resett"]) window["__resett"]();
        this.uiState.details = null;
    }

    @action selectBookmarks() {
        this.uiState.details = null;
        this.uiState.list = { type: "bookmarks" };
    }

    @action selectCategory(category: Category) {
        if (window["__resett"]) window["__resett"]();
        this.uiState.details = null;
        this.uiState.list = { type: "category", category };
        this.uiState.desiredOverlaySize = "full";
    }

    @action selectSearch(text?: string) {
        if (window["__resett"]) window["__resett"]();
        this.uiState.details = null;
        this.uiState.list = { type: "search", text: text || "", focused: false };
        this.uiState.activeListIndex = -1;
    }

    @action clickBookmarks() {
        if (window["__resett"]) window["__resett"]();
        this.uiState.menu = false;
        this.selectBookmarks();
        this.moveToList();
        this.showMap();
        // commit("setMenu", false);
        // dispatch("selectBookmarks");
        // dispatch("moveToList");
        // dispatch("showMap", id);
    }

    @action clickCategory(category: Category) {
        if (window["__resett"]) window["__resett"]();
        this.uiState.menu = false;
        this.selectCategory(category);
        this.moveToList();
        this.showMap();
        // commit("setMenu", false);
        // dispatch("selectCategory", id);
        // dispatch("moveToList");
        // dispatch("showMap", id);
    }

    @action clickFloor(floor) {
        if (window["__resett"]) window["__resett"]();
        this.uiState.moveToRect = floor.rect;
        this.showMap();
    }

    @action clickSeminars() {
        this.clickCategory(this.categoryStore.seminarsCategory);
    }

    @action clickBoothInList(booth: Booth) {
        if (window["__resett"]) window["__resett"]();
        this.uiState.hoveredBooth = null;
        this.selectBooth(booth);
        this.moveToList([booth]);
        this.showMap();
        // commit("setHoveredBooth", null);
        // dispatch("selectBooth", id);
        // // const booth = state.booths[id];
        // dispatch("moveToList", boothsToItems([booth]));
        // dispatch("showMap", id);
    }

    @action clickBoothInList2(booth: Booth) {
        if (window["__resett"]) window["__resett"]();
        this.uiState.hoveredBooth = null;
        this.selectBooth(booth);
        window.setTimeout(
            () => {
                this.moveToList([booth]);
                this.showMap();
            },
            navigator.userAgent.toLowerCase().indexOf("android") > -1 ? 400 : 50
        );

        // commit("setHoveredBooth", null);
        // dispatch("selectBooth", id);
        // // const booth = state.booths[id];
        // dispatch("moveToList", boothsToItems([booth]));
        // dispatch("showMap", id);
    }

    @action clickBooth(booth: Booth) {
        this.uiState.menu = false;

        if (this.uiState.selectedRoute && !booth) {
            return;
        }

        if (!booth) {
            this.uiState.details = null;
            return;
        }

        if (this.uiState.onBoothClick) {
            const e: FloorPlanBoothClickEvent = {
                target: booth,
            };
            this.uiState.onBoothClick(e);
        }

        if (booth instanceof RegularBooth && booth.exhibitors.length === 1) {
            this.selectExhibitor(booth.exhibitors[0]);
        } else {
            this.selectBooth(booth);
        }
        this.showMap();
        // commit("setMenu", false);
        // if (!id) {
        //     commit("setDetails", null);
        //     return;
        // }
        // // const booth = state.booths[id];
        // if (booth.exhibitors && booth.exhibitors.length === 1) {
        //     dispatch("selectExhibitor", booth.exhibitors[0]);
        //     // } else if (booth.exhibitors.length > 1) {
        //     //     dispatch('selectSearch', booth.name);
        // } else {
        //     dispatch("selectBooth", id);
        // }
        // dispatch("showMap", id);
    }

    @action clickExhibitor2(exhibitor: Exhibitor) {
        this.selectExhibitor(exhibitor);
        this.moveToExhibitor(exhibitor);
        this.showMap();
        // dispatch("selectExhibitor", id);
        // dispatch("moveToExhibitor", id);
        // dispatch("showMap");
    }

    @action clickExhibitor(exhibitor: Exhibitor) {
        window.setTimeout(
            () => {
                this.clickExhibitor2(exhibitor);
            },
            navigator.userAgent.toLowerCase().indexOf("android") > -1 ? 400 : 50
            // navigator.userAgent.indexOf("android") > -1 ? 400 : 50
        );

        // dispatch("selectExhibitor", id);
        // dispatch("moveToExhibitor", id);
        // dispatch("showMap");
    }

    @action showMap() {
        if (this.uiState.overlayPosition === "bottom" && isWebGlSupported) this.uiState.desiredOverlaySize = "medium";
        // if (getters.overlayPosition === "bottom" && isWebGlSupported() commit("setOverlaySize", "medium");
    }
    @action showOverlay() {
        if (this.uiState.overlayPosition === "bottom") this.uiState.desiredOverlaySize = "full";
        // if (getters.overlayPosition === "bottom") commit("setOverlaySize", "full");
    }
    @action toggleMapOverlay() {
        if (this.uiState.overlayPosition === "bottom" && this.uiState.overlaySize === "full")
            this.uiState.desiredOverlaySize = "medium";
        else if (this.uiState.overlayPosition === "bottom" && this.uiState.overlaySize !== "full")
            this.uiState.desiredOverlaySize = "full";
        // if (getters.overlayPosition === "bottom" && state.overlaySize === "full") commit("setOverlaySize", "medium");
        // else if (getters.overlayPosition === "bottom" && state.overlaySize !== "full") commit("setOverlaySize", "full");
    }
    @action moveToList(items?: ListItem[]) {
        // take only to booths and exhibitors, ignore categories
        items = items || this.uiState.listItems;
        const booths = [];
        items.forEach((item) => {
            if (item instanceof Exhibitor) {
                booths.push(...item.booths);
            } else if (item instanceof BoothBase) {
                booths.push(item);
            }
        });
        console.log("zzz", booths);
        this.uiState.moveToBooths = booths;
        // commit("setMoveToBooths", booths);
    }
    @action moveToExhibitor(exhibitor: Exhibitor) {
        // alert(exhibitor.id);
        this.moveToList([exhibitor]);
        // dispatch("moveToList", exhibitorsToItems([state.exhibitors[id]]));
    }
    @action changeActiveListIndex(delta: 1 | 0 | -1) {
        let newVal = this.uiState.activeListIndex + delta;
        newVal = Math.max(0, Math.min(this.uiState.listItems.length - 1, newVal));
        this.uiState.activeListIndex = newVal;
        // commit("setActiveListIndex", newVal);
    }
    @action openActiveListItem() {
        const item = this.uiState.listItems[this.uiState.activeListIndex];
        if (!item) return;
        logger.log("Opening", item);
        if (item instanceof Exhibitor) {
            this.clickExhibitor(item);
        } else if (item instanceof Category) {
            this.clickCategory(item);
        } else if (item instanceof BoothBase) {
            this.clickBoothInList2(item);
        }
        // switch (item.type) {
        //     case "exhibitor":
        //         dispatch("clickExhibitor", item.obj.id);
        //         break;
        //     case "category":
        //         dispatch("clickCategory", item.obj.id);
        //         break;
        //     case "booth":
        //         dispatch("clickBoothInList", item.obj.id);
        //         break;
        // }
    }
}
