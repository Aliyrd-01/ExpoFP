import { createBrowserHistory } from "history";
import { autorun } from "mobx";
import { hanleCustomCommand } from "../components/Search";
import data from "../data";
import store, { uiState } from "../store";
import { Booth } from "../store/BoothStore";
import { Category } from "../store/CategoryStore";
import { Exhibitor } from "../store/ExhibitorStore";
import { Route } from "../store/RouteStore";
import logger from "../tools/logger";
// import settings from '@/settings';

const history = createBrowserHistory();
const pathname = window.location.pathname;

let disableStateToUrl = false;
let savedSelectedExhibitor: Exhibitor | null = null;
let savedSelectedBooth: Booth | null = null;

history.listen((location, action) => {
    logger.log("history", action, location);
    if (action === "POP") {
        // we moved back in history - need to adjust selected exhibitor//search-text
        dispatchFromUrl();
    }
});

function getHistoryUrl(search: string) {
    return pathname + search;
}

function historyPush(search: string) {
    history.push(getHistoryUrl(search));
}

export function historyReplace(search: string) {
    history.replace(getHistoryUrl(search));
}

function dispatchFromUrl() {
    const slug = history.location.search.length > 1 ? decodeURIComponent(history.location.search.substring(1)) : "";
    disableStateToUrl = true;

    const booth = store.boothStore.booths.find((x: Booth) => x.slug === slug || x.externalId === slug);

    if (hanleCustomCommand(slug, false)) {
    } else if (slug.startsWith("route")) {
        const parts = slug.split(":");
        const from = store.boothStore.booths.find((x: Booth) => x.slug === parts[2] || x.externalId === parts[2]) || null;
        const to = store.boothStore.booths.find((x: Booth) => x.slug === parts[1] || x.externalId === parts[1]) || null;
        store.routeStore.onlyAccessible = parts[3] === "true";
        store.routeStore.selectRoute(new Route(from, to));
    } else if (slug === "bookmarks") {
        store.selectBookmarks();
    } else if (slug === "-pdf") {
        store.uiState.printingPdf = true;
    } else if (booth) {
        setTimeout(() => store.selectBooth(booth), 250);
    } else {
        const exhibitor = store.exhibitorStore.exhibitors.find((x: Exhibitor) => x.slug === slug || x.externalId === slug);
        if (exhibitor) setTimeout(() => store.clickExhibitor(exhibitor), 250);
        else {
            const category = store.categoryStore.categories.find((x: Category) => x.slug === slug);
            if (category) store.selectCategory(category);
            else store.selectSearch(slug);
        }
    }

    disableStateToUrl = false;
    stateToUrl();
    setTitle();
}

function setTitle() {
    const exhibitor = uiState.selectedExhibitor;
    let title = "";
    if (exhibitor) title = exhibitor.name;
    else if (uiState.list.type === "search" && uiState.list.text) title = "`" + uiState.list.text + "`";

    if (title.length) title += " – ";
    title += data.title;
    if (data.subtitle) title += " – " + data.subtitle;
    title += " – Expo Floor Plan by ExpoFP";

    document.title = title;
}

function stateToUrl() {
    let queryRaw = "";
    const exhibitor = uiState.selectedExhibitor;
    const booth = uiState.selectedBooth;
    const route = uiState.selectedRoute;

    if (route) {
        const from = route.from ? `:${route.from.slug}` : "";
        const to = route.to ? `:${route.to.slug}` : "";
        const accessible = store.routeStore.onlyAccessible ? ":true" : "";

        queryRaw = `route${to}${from}${accessible}`;
    } else if (exhibitor) {
        queryRaw = exhibitor.slug;
    } else if (booth) {
        queryRaw = booth.slug;
    } else {
        switch (uiState.list.type) {
            case "bookmarks":
                queryRaw = "bookmarks";
                break;
            case "category":
                queryRaw = uiState.selectedCategory.slug;
                break;
            case "search":
                queryRaw = uiState.list.text;
                break;
            default:
                throw new Error("Unkown list.type");
        }
    }

    // put it here for autorun to continue capturing required observables
    if (disableStateToUrl) return;

    const newQuery = queryRaw ? "?" + encodeURIComponent(queryRaw) : "";

    if (history.location.search === newQuery) return;

    if (exhibitor !== savedSelectedExhibitor || booth !== savedSelectedBooth) {
        // logger.log('history push', newQuery, exhibitor !== savedSelectedExhibitor, booth !== savedSelectedBooth);
        historyPush(newQuery);
    } else {
        // logger.log('history replace', newQuery, exhibitor !== savedSelectedExhibitor, booth !== savedSelectedBooth);
        // logger.log('history replace', queryRaw);
        historyReplace(newQuery);
    }

    savedSelectedExhibitor = exhibitor;
    savedSelectedBooth = booth;
}

const locationSearch = history.location.search;

// preview fix
if (locationSearch.startsWith("?preview=")) {
    historyReplace("?");
}
// go to bookmarks when receive thouse
else if (locationSearch.startsWith("?b=")) {
    historyReplace("?bookmarks");
} else if (locationSearch.startsWith("?ba=")) {
    const url = new URL(window.location.href);
    const ba = parseInt(url.searchParams.get("ba"));
    const exhibitor = store.exhibitorStore.exhibitorById.get(ba);
    if (exhibitor) historyReplace("?" + exhibitor.slug);
    else historyReplace("?bookmarks");
} else if (locationSearch.includes("noOverlay")) {
    const url = new URL(window.location.href);
    const noOverlayParamValue = url.searchParams.get("noOverlay");

    if (noOverlayParamValue === "true") {
        url.searchParams.delete("noOverlay");

        let newSearch = url.search;
        newSearch = newSearch.replace(/=&/g, "&").replace(/=$/, "");

        historyReplace(newSearch);
        store.uiState.hideOverlay = true;
    }
}

// facebook and google  fix
else if (
    locationSearch.startsWith("?fbclid") ||
    locationSearch.startsWith("?_ga") ||
    /^\?\S{1,10}(=|%3D)/i.test(locationSearch)
) {
    historyReplace("?");
}

if (uiState.previewExhibitor) {
    historyReplace("?" + uiState.previewExhibitor.slug);
}

dispatchFromUrl();
autorun(setTitle);
autorun(stateToUrl);
