import Vue from 'vue'
import Vuex, { GetterTree } from 'vuex'
import booths from './booths'
import exhibitors from './exhibitors'
import categories from './categories'
import bookmarked from './bookmarked'
import screenSize from './screen-size'
import filtering from './filtering'

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
        list: null as { type: "search", text: string, focused: boolean } | { type: "bookmarks" } | { type: "category", id: number },
        // searchText: '',
        // searchFocused: false,
        details: null as { type: "booth" | "exhibitor"; id: number; },
        overlaySize: "medium" as OverlaySize,
        moveToExhibitor: null as number,
        hoveredBooth: null as number,
        hoveredExhibitor: null as number,
        menu: false,
        //
        booths: null as typeof booths.state,
        exhibitors: null as typeof exhibitors.state,
        categories: null as typeof categories.state,
        bookmarked: null as typeof bookmarked.state,
        screenSize: null as typeof screenSize.state,
    },
    getters: {
        overlayPosition: (state) => {
            const screen = state.screenSize;
            if (!screen || screen.width > 820) return "left"
            if (screen.width > screen.height) return "bottomLeft"
            return "bottom"
        },
        selectedExhibitor: state => state.details && state.details.type === "exhibitor" ? state.exhibitors[state.details.id] : null,
        selectedBooth: (state) => state.details && state.details.type === "booth" ? state.booths[state.details.id] : null,
        selectedCategory: (state) => state.list.type === "category" ? state.categories[state.list.id] : null,
    },
    mutations: {
        // setSearchText(state, text) {
        //     state.searchText = text;
        // },
        // setSearchFocused(state, val) {
        //     state.searchFocused = val;
        // },
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
        setMoveToExhibitor(state, item) {
            state.moveToExhibitor = item;
        },
        setHoveredBooth(state, item) {
            state.hoveredBooth = item || null;
        },
        setHoveredExhibitor(state, item) {
            state.hoveredExhibitor = item || null;
        },
        setMenu(state, shown) {
            state.menu = shown;
        }
    },
    actions: {
        selectExhibitor({ commit }, id) {
            commit('setDetails', { type: 'exhibitor', id });
        },
        selectBooth({ commit }, id) {
            commit('setDetails', { type: 'booth', id });
        },
        selectNone({ commit }) {
            commit('setDetails', null);
        },
        selectBookmarks({ commit }) {
            commit('setDetails', null);
            commit('setList', { type: "bookmarks" });
        },
        selectCategory({ commit }, id) {
            commit('setDetails', null);
            commit('setList', { type: "category", id });
        },
        selectSearch({ commit }, text) {
            commit('setDetails', null);
            commit('setList', { type: "search", text: text || '' });
        },
        clickBooth({ state, dispatch, commit }, id) {
            if (!id) {
                commit('setDetails', null);
                return;
            }
            const booth = state.booths[id];
            if (booth.exhibitors.length === 1) {
                dispatch('selectExhibitor', booth.exhibitors[0]);
            } else if (booth.exhibitors.length > 1) {
                dispatch('selectText', booth.name);
            } else {
                dispatch('selectBooth', id);
            }
        },
        clickExhibitor({ commit, dispatch }, id) {
            dispatch('selectExhibitor', id);
            commit('setMoveToExhibitor', id);
        },
        // clickBookmark({ state, commit }, id) {
        //     if (state.bookmarked.has(id)
        // }
    }
})


declare global {
    const store: typeof store1;
}

extendGlobal({ store: store1 })