import exhibitorsState from "./exhibitors";

type BookmarkedType = { [id: string]: boolean };

// pick only who still exist
let bookmarkedAr: number[];

const url = new URL(window.location.href);
const c = url.searchParams.get("b");
if (c) {
    bookmarkedAr = c
        .split("|")
        .map(x => parseInt(x))
        .filter(x => x);
    saveToLocalStorage(bookmarkedAr);
} else {
    const ls = localStorage.getItem("bookmarked");
    bookmarkedAr = ls ? (JSON.parse(ls) as number[]).filter(e => exhibitorsState.state[e]) : [];
}

const bookmarked = bookmarkedAr.reduce((c: BookmarkedType, id) => (c[id] = true) && c, {} as BookmarkedType);
const bookmarkedArray = (state: BookmarkedType) => Object.keys(state).filter(x => state[x]);

function saveToLocalStorage(ar: number[]) {
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
            // persist in localStorage
            saveToLocalStorage(bookmarkedArray(state));
        }
    }
};
