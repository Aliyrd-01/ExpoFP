import { createBrowserHistory } from 'history'
import settings from '@/settings';

const history = createBrowserHistory();


let disableStateToUrl = false;
let savedSelectedExhibitor: Exhibitor | null = null;
let savedSelectedBooth: Booth | null = null;

history.listen((location, action) => {
    console.log('history', action, location);
    if (action === 'POP') {
        // we moved back in history - need to adjust selected exhibitor//search-text
        dispatchFromUrl();
    }
})

function dispatchFromUrl() {
    const slug = history.location.search.length > 1 ? decodeURIComponent(history.location.search.substring(1)) : '';
    const state = store.state;
    disableStateToUrl = true;
    const booth = store.getters.boothsArray.find((x: Booth) => x.slug === slug);
    if (slug === "bookmarks") {
        store.dispatch('selectBookmarks');
    } else if (booth) {
        store.dispatch('selectBooth', booth.id);
    } else {
        const exhibitor = store.getters.exhibitorsArray.find((x: Exhibitor) => x.slug === slug);
        if (exhibitor) store.dispatch('selectExhibitor', exhibitor.id);
        else store.dispatch('selectSearch', slug);

    }

    disableStateToUrl = false;
    stateToUrl();
    setTitle();
}

function setTitle() {
    const exhibitor = store.getters.selectedExhibitor;
    let title = '';
    if (exhibitor) title = exhibitor.name;
    else if (store.state.searchText) title = '`' + store.state.searchText + '`';

    if (title.length) title += ' – ';
    title += EFP_TITLE + ' – Expo Floor Plan by ExpoFP';

    document.title = title;
}

store.subscribe(() => {
    stateToUrl();
    setTitle();
});

function stateToUrl() {
    if (disableStateToUrl) return;
    const exhibitor = store.getters.selectedExhibitor
    const booth = store.getters.selectedBooth
    let queryRaw = exhibitor ? exhibitor.slug : booth ? booth.slug : null;
    if (!queryRaw){
        if (store.state.list.type === "search") queryRaw = store.state.list.text;
    }
    const newQuery = queryRaw ? '?' + encodeURIComponent(queryRaw) : '';

    if (history.location.search === newQuery) return;

    if (exhibitor !== savedSelectedExhibitor || booth !== savedSelectedBooth) {
        // console.log('history push', queryRaw);
        history.push(newQuery);
    } else {
        // console.log('history replace', queryRaw);
        history.replace(newQuery);
    }

    savedSelectedExhibitor = exhibitor;
    savedSelectedBooth = booth;
}

dispatchFromUrl();
setTitle();