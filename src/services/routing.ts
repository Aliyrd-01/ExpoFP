import { createBrowserHistory } from "history";
import { autorun } from "mobx";
import { Booth } from "../core/Booth";
import FloorPlanReady from "../floorplan.ready";
// import store, { uiState } from "../store";
// import { Booth } from "../store/BoothStore";
import { Category } from "../store/CategoryStore";
import { Exhibitor } from "../store/ExhibitorStore";
import gtag from "../tools/gtag";
import logger from "../tools/logger";

export default function startRouting(fp: FloorPlanReady) {
    const store = fp.store;
    const uiState = store.uiState;
    const data = fp.data;
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

    function historyReplace(search: string) {
        history.replace(getHistoryUrl(search));
    }

    function dispatchFromUrl() {
        const slug = history.location.search.length > 1 ? decodeURIComponent(history.location.search.substring(1)) : "";
        disableStateToUrl = true;
        const booth = store.boothStore.booths.find((x: Booth) => x.slug === slug);
        if (slug === "bookmarks") {
            store.selectBookmarks();
        } else if (booth) {
            store.selectBooth(booth);
        } else {
            const exhibitor = store.exhibitorStore.exhibitors.find((x: Exhibitor) => x.slug === slug);
            if (exhibitor) store.selectExhibitor(exhibitor);
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

        if (exhibitor) {
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
            sendGa();
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
    if (locationSearch.startsWith("?b=")) {
        historyReplace("?bookmarks");
    }

    if (locationSearch.startsWith("?ba=")) {
        const url = new URL(window.location.href);
        const ba = parseInt(url.searchParams.get("ba"));
        const exhibitor = store.exhibitorStore.exhibitorById.get(ba);
        if (exhibitor) historyReplace("?" + exhibitor.slug);
        else historyReplace("?bookmarks");
    }

    // facebook fix
    if (locationSearch.startsWith("?fbclid")) {
        historyReplace("?");
    }

    // admin api fix
    if (locationSearch.startsWith("?ea81h")) {
        historyReplace("?");
    }

    if (uiState.previewExhibitor) {
        historyReplace("?" + uiState.previewExhibitor.slug);
    }

    dispatchFromUrl();
    autorun(setTitle);
    autorun(stateToUrl);

    let timeout: number;

    function sendGa() {
        if (!data.gtag) return;
        if (timeout) window.clearTimeout(timeout);
        timeout = window.setTimeout(() => {
            gtag("config", data.gtag, {
                page_title: document.title,
                page_path: window.location.pathname + window.location.search
            });
        }, 1000);
    }
}
