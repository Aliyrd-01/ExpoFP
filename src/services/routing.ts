import { createBrowserHistory } from "history";
// import settings from '@/settings';

const history = createBrowserHistory();

let disableStateToUrl = false;
let savedSelectedExhibitor: Exhibitor | null = null;
let savedSelectedBooth: Booth | null = null;

history.listen((location, action) => {
    console.log("history", action, location);
    if (action === "POP") {
        // we moved back in history - need to adjust selected exhibitor//search-text
        dispatchFromUrl();
    }
});

function dispatchFromUrl() {
    const slug = history.location.search.length > 1 ? decodeURIComponent(history.location.search.substring(1)) : "";
    disableStateToUrl = true;
    const booth = store.getters.boothsArray.find((x: Booth) => x.slug === slug);
    if (slug === "bookmarks") {
        store.dispatch("selectBookmarks");
    } else if (booth) {
        store.dispatch("selectBooth", booth.id);
    } else {
        const exhibitor = store.getters.exhibitorsArray.find((x: Exhibitor) => x.slug === slug);
        if (exhibitor) store.dispatch("selectExhibitor", exhibitor.id);
        else {
            const category = store.getters.categoriesArray.find((x: Category) => x.slug === slug);
            if (category) store.dispatch("selectCategory", category.id);
            else store.dispatch("selectSearch", slug);
        }
    }

    disableStateToUrl = false;
    stateToUrl();
    setTitle();
}

function setTitle() {
    const exhibitor = store.getters.selectedExhibitor;
    let title = "";
    if (exhibitor) title = exhibitor.name;
    else if (store.state.searchText) title = "`" + store.state.searchText + "`";

    if (title.length) title += " – ";
    title += __data.title;
    if (__data.subtitle) title += " – " + __data.subtitle;
    title +=" – Expo Floor Plan by ExpoFP";

    document.title = title;
}

store.subscribe(() => {
    stateToUrl();
    setTitle();
});

function stateToUrl() {
    if (disableStateToUrl) return;
    let queryRaw = "";
    const exhibitor = store.getters.selectedExhibitor;
    const booth = store.getters.selectedBooth;

    if (exhibitor) {
        queryRaw = exhibitor.slug;
    } else if (booth) {
        queryRaw = booth.slug;
    } else {
        switch (store.state.list.type) {
            case "bookmarks":
                queryRaw = "bookmarks";
                break;
            case "category":
                queryRaw = store.getters.selectedCategory.slug;
                break;
            case "search":
                queryRaw = store.state.list.text;
                break;
            default:
                throw new Error("Unkown list.type");
        }
    }

    const newQuery = queryRaw ? "?" + encodeURIComponent(queryRaw) : "";

    if (history.location.search === newQuery) return;

    if (exhibitor !== savedSelectedExhibitor || booth !== savedSelectedBooth) {
        // console.log('history push', queryRaw);
        history.push(newQuery);
        sendGa();
    } else {
        // console.log('history replace', queryRaw);
        history.replace(newQuery);
    }

    savedSelectedExhibitor = exhibitor;
    savedSelectedBooth = booth;
}

// preview fix
if (history.location.search.startsWith("?preview=")) {
    history.replace("?");
}
// go to bookmarks when receive thouse
if (history.location.search.startsWith("?b=")) {
    history.replace("?bookmarks");
}

// facebook fix
if (history.location.search.startsWith("?fbclid")) {
    history.replace("?");
}

if (store.state.previewExhibitor) {
    history.replace("?" + store.state.exhibitors[store.state.previewExhibitor].slug);
}

dispatchFromUrl();
setTitle();

let timeout: number;

function sendGa() {
    if (typeof gtag === "undefined") return;
    if (timeout) window.clearTimeout(timeout);
    timeout = window.setTimeout(() => {
        gtag("config", GTAG, {
            page_title: document.title,
            page_path: location.pathname + location.search
        });
    }, 1000);
}
