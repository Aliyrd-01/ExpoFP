import exhibitorsState from "./exhibitors";
import Vue from 'vue';

type BookmarkedType = { [id: string]: boolean };

// pick only who still exist
let bookmarkedAr: number[];

const url = new URL(window.location.href);
const c = url.searchParams.get("b");
const ca = url.searchParams.get("ba");
const combined = c || ca;
if (combined) {

    bookmarkedAr = combined
        .split("|")
        .map(x => parseInt(x))
        .filter(x => x);

    const append = !!ca;
    if (append) bookmarkedAr.push(...getFromLocalStorage());
    saveToLocalStorage(bookmarkedAr);
} else {
    bookmarkedAr = getFromLocalStorage();
}

const bookmarked = bookmarkedAr.reduce((c: BookmarkedType, id) => (c[id] = true) && c, {} as BookmarkedType);
const bookmarkedArray = (state: BookmarkedType) => Object.keys(state).filter(x => state[x]);

function getFromLocalStorage() {
    const ls = localStorage.getItem("bookmarked");
    return ls ? (JSON.parse(ls) as number[]).filter(e => exhibitorsState.state[e]) : [];
}

function saveToLocalStorage(ar: (string | number)[]) {
    // const dest = [...ar, ...(append ? getFromLocalStorage() : [])];
    // const unique = Array.from(new Set(dest));
    // debugger
    localStorage.setItem("bookmarked", JSON.stringify(ar));
}

export default {
    state: bookmarked,
    getters: {
        bookmarkedArray
    },
    mutations: {
        setBookmarked(state: BookmarkedType, { id, yes }: any) {
            if (yes) Vue.set(state, id, true);
            else Vue.delete(state, id);
            saveToLocalStorage(bookmarkedArray(state));
        }
    }
};
