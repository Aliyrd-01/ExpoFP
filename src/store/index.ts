import Vue from "vue";
import Vuex from "vuex";
import booths from "./booths";
import exhibitors from "./exhibitors";
import categories from "./categories";
import bookmarked from "./bookmarked";
import screenSize from "./screen-size";
import filtering, { SearchResultItem, exhibitorsToItems, boothsToItems } from "./filtering";
import previewExhibitor from "@/utils/preview-exhibitor";
import { isWebGlSupported, remsToPixels } from "@/components/Map/utils";


type ListType = { type: "search"; text: string; focused: boolean } | { type: "bookmarks" } | { type: "category"; id: number };

Vue.use(Vuex);

const store1 = new Vuex.Store({
    modules: {
        booths,
        exhibitors,
        categories,
        bookmarked,
        screenSize,
        filtering
    },
    state: {
        list: { type: "search", text: "" } as ListType,
        // searchText: '',
        searchFocused: false,
        details: null as { type: "booth" | "exhibitor"; id: number },
        overlaySize: "medium" as OverlaySize,
        centerMap: false,
        moveToBooths: null as number[],
        hoveredBooth: null as number,
        hoveredExhibitor: null as number,
        previewExhibitor: previewExhibitor ? previewExhibitor.id : null,
        menu: false,
        overlayShowsAll: false,
        activeListIndex: -1,
        //
        booths: null as typeof booths.state,
        exhibitors: null as typeof exhibitors.state,
        categories: null as typeof categories.state,
        bookmarked: null as typeof bookmarked.state,
        screenSize: null as typeof screenSize.state,
        overlayWidthRems: 23.5,
        overlayMediumHeightRems: 10
    },
    getters: {
        overlayPosition: state => {
            const screen = state.screenSize;
            if (!screen || screen.width > 550) return "left";
            // if (screen.width > 450) return "left"
            return "bottom";
        },
        selectedExhibitor: state =>
            state.details && state.details.type === "exhibitor" ? state.exhibitors[state.details.id] : null,
        selectedBooth: state => (state.details && state.details.type === "booth" ? state.booths[state.details.id] : null),
        selectedCategory: state => (state.list.type === "category" ? state.categories[state.list.id] : null),

        wsHeightPx: (state, getters) => getters.advertisedExhibitors.length ? 48 : 0,
        wsFullHeightPx: (state, getters) => getters.wsHeightPx ? getters.wsHeightPx + remsToPixels(0.3 * 2) : 0
    },
    mutations: {
        // setSearchText(state, text) {
        //     state.searchText = text;
        // },
        setOverlayShowsAll(state, val) {
            state.overlayShowsAll = val;
        },
        setSearchFocused(state, val) {
            state.searchFocused = val;
        },
        setList(state, val) {
            state.list = val;
        },
        setScreenSize(state, size) {
            state.screenSize = size;
        },
        setOverlaySize(state, size) {
            state.overlaySize = size;
        },
        setDetails(state, item) {
            state.details = item;
        },
        setMoveToBooths(state, item) {
            state.moveToBooths = item;
        },
        setCenterMap(state, val) {
            state.centerMap = val;
        },
        setHoveredBooth(state, item) {
            state.hoveredBooth = item || null;
        },
        setHoveredExhibitor(state, item) {
            state.hoveredExhibitor = item || null;
        },
        setMenu(state, shown) {
            state.menu = shown;
        },
        setActiveListIndex(state, val) {
            state.activeListIndex = val;
        }
    },
    actions: {
        selectExhibitor({ commit }, id) {
            commit("setHoveredExhibitor", null);
            commit("setDetails", { type: "exhibitor", id });
        },
        selectBooth({ commit }, id) {
            commit("setDetails", { type: "booth", id });
        },
        selectNone({ commit }) {
            commit("setDetails", null);
        },
        selectBookmarks({ commit }) {
            commit("setDetails", null);
            commit("setList", { type: "bookmarks" });
        },
        selectCategory({ commit }, id) {
            commit("setDetails", null);
            commit("setList", { type: "category", id });
            commit("setOverlaySize", "full");
        },
        selectSearch({ commit }, text) {
            commit("setDetails", null);
            commit("setList", { type: "search", text: text || "" });
            commit("setActiveListIndex", -1);
        },
        clickBookmarks({ commit, dispatch }, id) {
            commit("setMenu", false);
            dispatch("selectBookmarks");
            dispatch("moveToList");
            dispatch("showMap", id);
        },
        clickCategory({ commit, dispatch }, id) {
            commit("setMenu", false);
            dispatch("selectCategory", id);
            dispatch("moveToList");
            dispatch("showMap", id);
        },
        clickSeminars({ commit, dispatch, getters }) {
            dispatch("clickCategory", getters.seminarsCategoryId);
        },
        clickBoothInList({ state, getters, dispatch, commit }, id) {
            commit("setHoveredBooth", null);
            dispatch("selectBooth", id);
            const booth = state.booths[id];
            dispatch("moveToList", boothsToItems([booth]));
            dispatch("showMap", id);
        },
        clickBooth({ state, getters, dispatch, commit }, id) {
            commit("setMenu", false);
            if (!id) {
                commit("setDetails", null);
                return;
            }
            const booth = state.booths[id];
            if (booth.exhibitors && booth.exhibitors.length === 1) {
                dispatch("selectExhibitor", booth.exhibitors[0]);
                // } else if (booth.exhibitors.length > 1) {
                //     dispatch('selectSearch', booth.name);
            } else {
                dispatch("selectBooth", id);
            }
            dispatch("showMap", id);
        },
        clickExhibitor({ state, commit, dispatch }, id) {
            dispatch("selectExhibitor", id);
            dispatch("moveToExhibitor", id);
            dispatch("showMap");
        },
        showMap({ getters, commit }) {
            if (getters.overlayPosition === "bottom" && isWebGlSupported()) commit("setOverlaySize", "medium");
        },
        showOverlay({ getters, commit }) {
            if (getters.overlayPosition === "bottom") commit("setOverlaySize", "full");
        },
        toggleMapOverlay({ getters, state, commit }) {
            if (getters.overlayPosition === "bottom" && state.overlaySize === "full") commit("setOverlaySize", "medium");
            else if (getters.overlayPosition === "bottom" && state.overlaySize !== "full") commit("setOverlaySize", "full");
        },
        moveToList({ state, commit, getters }, items) {
            // take only to booths and exhibitors, ignore categories
            items = items || (getters.listItems as SearchResultItem[]);
            const booths = [];
            items.forEach(item => {
                switch (item.type) {
                    case "exhibitor":
                        booths.push(...item.obj.booths);
                        break;
                    case "booth":
                        booths.push(item.obj.id);
                        break;
                }
            });
            // ids.forEach(id => booths.push(...state.exhibitors[id].booths));
            // dispatch('moveToExhibitors', getters.listExhibitorsIds);
            commit("setMoveToBooths", booths);
            // commit("setCenterMap", true)
        },
        moveToExhibitor({ state, commit, dispatch }, id) {
            dispatch("moveToList", exhibitorsToItems([state.exhibitors[id]]));
        },
        changeActiveListIndex({ state, getters, commit }, delta) {
            let newVal = state.activeListIndex + delta;
            newVal = Math.max(0, Math.min(getters.listItems.length - 1, newVal));
            commit("setActiveListIndex", newVal);
        },
        openActiveListItem({ state, getters, dispatch }) {
            const item = getters.listItems[state.activeListIndex];
            if (!item) return;
            __logger.log("Opening", item);
            switch (item.type) {
                case "exhibitor":
                    dispatch("clickExhibitor", item.obj.id);
                    break;
                case "category":
                    dispatch("clickCategory", item.obj.id);
                    break;
                case "booth":
                    dispatch("clickBoothInList", item.obj.id);
                    break;
            }
        }
    }
});

declare global {
    const store: typeof store1;
}

extendGlobal({ store: store1 });
