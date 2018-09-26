import exhibitorsState from './exhibitors';

const ls = localStorage.getItem('bookmarked');
// pick only who still exist
const bookmarkedAr = ls ? (JSON.parse(ls) as number[]).filter(e => exhibitorsState.state[e]) : [];
type BookmarkedType = { [id: string]: boolean };
const bookmarked = bookmarkedAr.reduce((c: BookmarkedType, id) => (c[id] = true) && c, {} as BookmarkedType);

const bookmarkedArray = (state: BookmarkedType) => Object.keys(state).filter(x => state[x]);

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
            localStorage.setItem('bookmarked', JSON.stringify(bookmarkedArray(state)));
        }
    }
}