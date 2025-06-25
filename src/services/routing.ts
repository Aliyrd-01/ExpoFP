import { createBrowserHistory } from "history";
import { autorun, reaction } from "mobx";
import { handleCustomCommand } from "../components/Search";
import { KIOSK_ID_KEY, KIOSK_KEY, KIOSK_SETUP_KEY, PREVIEW_MODE_QUERY, PREVIEW_MODE_STORAGE_KEY, SEPARATOR } from "../constants";
import data from "../data";
import store, { uiState } from "../store";
import { Booth } from "../store/BoothStore";
import { Category } from "../store/CategoryStore";
import { Exhibitor } from "../store/ExhibitorStore";
import { CurrentPosition, extractRoute } from "../store/RouteStore";
import { setConsentSettings } from "../tools/gtag";
import logger from "../tools/logger";
import { isLocalStorageAvailable } from "../utils/localStorage";
import { MapSettings } from "../store/types";
// import settings from '@/settings';

let disableHistoryManipulation = false;
let disableStateToUrl = false;
let savedSelectedExhibitor: Exhibitor | null = null;
let savedSelectedBooth: Booth | null = null;
let unlisten;

const history = createBrowserHistory();
const pathname = window.location.pathname;
const routeHistory: string[] = [];

export function getLocationHistory() {
    return routeHistory;
}

function getHistoryUrl(search: string) {
    return pathname + search;
}

function historyPush(search: string) {
    if (!disableHistoryManipulation) {
        history.push(getHistoryUrl(search));
    }
}

function historyReplace(search: string) {
    if (!disableHistoryManipulation) {
        history.push(getHistoryUrl(search));
    }
}

function stateToUrl() {
    let queryRaw = "";
    const exhibitor = uiState.selectedExhibitor;
    const booth = uiState.selectedBooth;
    const route = uiState.selectedRoute;

    if (route) {
        const from = route.from ? `:${route.from.slug}` : "";
        const to = route.to ? `:${route.to.slug}` : "";
        const accessible = store.routeStore.onlyAccessible ? ":true" : ":false";
        const waypoints = route.waypoints?.map((w) => `:${w.slug}`).join("");
        queryRaw = `route${to}${from}${accessible}${waypoints || ""}`;
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
            case "language":
                queryRaw = uiState.list.type;
                break;
            case "filter":
                queryRaw = `${uiState.list.query.key}=${uiState.list.query.value}`;
                break;
            case "agenda":
                queryRaw = "agenda";
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

function executeCustomCommand() {
    const slug = history.location.search.length > 1 ? decodeURIComponent(history.location.search.substring(1)) : "";
    return handleCustomCommand(slug, false);
}

function dispatchFromUrl() {
    const slug = history.location.search.length > 1 ? decodeURIComponent(history.location.search.substring(1)) : "";
    disableStateToUrl = true;

    const booth = store.boothStore.booths.find(
        (x: Booth) => (
            x.slug?.toLowerCase() === slug?.toLowerCase()
            || x.externalId?.toLowerCase() === slug?.toLowerCase()
            || x.externalId?.toLowerCase()?.replace(/\s+/g, "") === slug?.toLowerCase()
        )
    );

    const searchParams = new URLSearchParams(decodeURIComponent(window.location.search));

    setMapSettings(searchParams);

    if (executeCustomCommand()) {
    } else if (searchParams.has("yah")) {
        const command = searchParams.get("yah");
        handleCustomCommand(`__yah ${command}`, true);
    } else if (searchParams.has(KIOSK_KEY)) {
        const command = searchParams.get(KIOSK_KEY);
        if (command === "1") {
            uiState.kiosk = true;
        } else if (command === "0") {
            uiState.kiosk = false;
        }
    } else if (slug.startsWith("route")) {
        const parts = slug.split(SEPARATOR);
        store.routeStore.onlyAccessible = parts[3] === "true";
        store.routeStore.selectRoute(extractRoute(parts[2], parts[1], parts.slice(4)));
    } else if (slug === "bookmarks") {
        store.selectBookmarks();
    } else if (slug === "language") {
        store.selectLanguage();
    } else if (slug === "agenda") {
        store.selectAgenda();
    } else if (slug === "-pdf") {
        store.uiState.printingPdf = true;
    } else if (slug.startsWith("hide")) {
        store.uiState.setVisibility(
            new URLSearchParams(slug)
                .get("hide")
                .split(",")
                .filter(Boolean)
                .reduce((acc, curr) => ({ ...acc, [curr]: false }), {})
        );
    } else if (booth) {
        store.selectBooth(booth);
    } else if (searchParams.has(KIOSK_SETUP_KEY) || searchParams.has(KIOSK_ID_KEY)) {
        disableHistoryManipulation = true;
        store.uiState.kiosk = true;

        // Removing YAH key and hide YAH icon
        const yahKey = "__yah";
        if (localStorage.getItem(yahKey)) {
            localStorage.removeItem(yahKey);
            window.location.reload();
        }
    } else {
        const exhibitor = store.exhibitorStore.exhibitors.find(
            (x: Exhibitor) =>
                x.slug?.toLowerCase() === slug?.toLowerCase() || x.externalId?.toLowerCase() === slug?.toLowerCase()
        );

        if (slug.startsWith("exhibitors")) {
            const exhibitors = slug.split("=")[1].split(",");
            store.fp.selectExhibitor(exhibitors);
        } else if (exhibitor) store.clickExhibitor(exhibitor);
        else {
            const category = store.categoryStore.categories.find((x: Category) => x.slug === slug);
            if (category) store.selectCategory(category);
            else if (!slug.includes("heatmap=true")) store.selectSearch(slug);
        }
    }

    disableStateToUrl = false;
    stateToUrl();
    setTitle();
}

function processURLParams() {
    const locationSearch = history.location.search;

    if (locationSearch.includes("heatmap")) {
        const url = new URL(window.location.href);
        const heatmapParamValue = url.searchParams.get("heatmap");

        if (heatmapParamValue === "true") {
            if (url.searchParams.get("type") === "yah") {
                let newSearch = url.search;
                newSearch = newSearch.replace(/=&/g, "&").replace(/=$/, "");
                disableHistoryManipulation = true;

                historyReplace(newSearch);

                store.uiState.heatmapYah = true;
                store.uiState.monochrome = true;
                store.uiState.hideLogoInBooth = true;
                store.uiState.hideHeaderLogo = true;
                store.uiState.disableBookmarked = true;
            } else {
                url.searchParams.delete("heatmap");

                let newSearch = url.search;
                newSearch = newSearch.replace(/=&/g, "&").replace(/=$/, "");
                disableHistoryManipulation = true;

                historyReplace(newSearch);
                store.uiState.heatmap = true;
            }
        }
    }

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
    } else if (locationSearch.startsWith("?mapbox=false")) {
        store.mapboxStore.isMapbox = false;
        historyReplace("?");
    }

    if (locationSearch.includes("blue-dot")) {
        const url = new URL(window.location.href);
        const blueDotParams = url.searchParams.get("blue-dot").split(",");
        url.searchParams.delete("blue-dot");

        if (blueDotParams.length > 1) {
            const layerName = store.layerStore.findLayer(blueDotParams[2])?.shortName;

            const currentPosition = new CurrentPosition(
                Number(blueDotParams[0]) || undefined,
                Number(blueDotParams[1]) || undefined,
                layerName,
                undefined,
                Number(blueDotParams[3]) || undefined,
                Number(blueDotParams[4]) || undefined
            );

            if (!store.layerStore.layersLoaded) {
                reaction(
                    () => store.layerStore.layersLoaded,
                    () => {
                        store.routeStore.selectCurrentPosition(currentPosition, false, 0);
                    }
                );
            } else {
                store.routeStore.selectCurrentPosition(currentPosition, false, 0);
            }
        }

        let newSearch = url.search;
        newSearch = newSearch.replace(/=&/g, "&").replace(/=$/, "");
        historyReplace(newSearch);
    }

    if (locationSearch.includes("copy_exh")) {
        const url = new URL(window.location.href);
        const noOverlayParamValue = url.searchParams.get("copy_exh");
        url.searchParams.delete("copy_exh");
        historyReplace("?");
    }

    if (locationSearch.includes("noOverlay")) {
        const url = new URL(window.location.href);
        const noOverlayParamValue = url.searchParams.get("noOverlay");

        url.searchParams.delete("noOverlay");
        let newSearch = url.search;
        newSearch = newSearch.replace(/=&/g, "&").replace(/=$/, "");
        if (noOverlayParamValue === "true") {
            store.uiState.hideOverlay = true;
        } else if (noOverlayParamValue === "false") {
            store.uiState.hideOverlay = false;
        }
        historyReplace(newSearch);
    }

    if (locationSearch.includes("allowConsent")) {
        const url = new URL(window.location.href);
        const allowConsentValue = url.searchParams.get("allowConsent");
        url.searchParams.delete("allowConsent");

        const newSearch = url.search.replace(/=&/g, "&").replace(/=$/, "");
        if (allowConsentValue === "true") {
            setConsentSettings(true);
        } else if (allowConsentValue === "false") {
            setConsentSettings(false);
        }

        historyReplace(newSearch);
    }

    if (locationSearch.includes("hideHeaderLogo")) {
        const url = new URL(window.location.href);
        const value = url.searchParams.get("hideHeaderLogo");
        url.searchParams.delete("hideHeaderLogo");

        const newSearch = url.search.replace(/=&/g, "&").replace(/=$/, "");
        if (value === "true") {
            uiState.hideHeaderLogo = true;
        }

        historyReplace(newSearch);
    }

    if (locationSearch.includes("hideLogoInBooth")) {
        const url = new URL(window.location.href);
        const value = url.searchParams.get("hideLogoInBooth");
        url.searchParams.delete("hideLogoInBooth");

        const newSearch = url.search.replace(/=&/g, "&").replace(/=$/, "");
        if (value === "true") {
            uiState.hideLogoInBooth = true;
        }

        historyReplace(newSearch);
    }

    if (locationSearch.includes("disableFeatured")) {
        const url = new URL(window.location.href);
        const value = url.searchParams.get("disableFeatured");
        url.searchParams.delete("disableFeatured");

        const newSearch = url.search.replace(/=&/g, "&").replace(/=$/, "");
        if (value === "true") {
            store.exhibitorStore.exhibitors.forEach(ex => ex.featured = false);
        }

        historyReplace(newSearch);
    }

    if (locationSearch.includes("disableBookmarked")) {
        const url = new URL(window.location.href);
        const value = url.searchParams.get("disableBookmarked");
        url.searchParams.delete("disableBookmarked");

        const newSearch = url.search.replace(/=&/g, "&").replace(/=$/, "");
        if (value === "true") {
            uiState.disableBookmarked = true;
        }

        historyReplace(newSearch);
    }

    if (locationSearch.includes("disableGps")) {
        const url = new URL(window.location.href);
        const value = url.searchParams.get("disableGps");
        url.searchParams.delete("disableGps");

        const newSearch = url.search.replace(/=&/g, "&").replace(/=$/, "");
        if (value === "true") {
            uiState.disableGps = true;
        }

        historyReplace(newSearch);
    }

    if (locationSearch.includes("monochrome")) {
        const url = new URL(window.location.href);
        const value = url.searchParams.get("monochrome");
        url.searchParams.delete("monochrome");

        const newSearch = url.search.replace(/=&/g, "&").replace(/=$/, "");
        if (value === "true") {
            uiState.monochrome = true;
        }

        historyReplace(newSearch);
    }

    // facebook and google  fix
    if (
        locationSearch.startsWith("?fbclid") ||
        locationSearch.startsWith("?_ga")
    ) {
        historyReplace("?");
    }

    if (locationSearch.includes(PREVIEW_MODE_QUERY)) {
        const url = new URL(window.location.href);
        const value = url.searchParams.get(PREVIEW_MODE_QUERY);
        if (value === "true") {
            isLocalStorageAvailable && localStorage.setItem(PREVIEW_MODE_STORAGE_KEY, "1");
        } else if (value === "false") {
            isLocalStorageAvailable && localStorage.removeItem(PREVIEW_MODE_STORAGE_KEY);
        }

        url.searchParams.delete(PREVIEW_MODE_QUERY);
        historyReplace(url.search.replace(/=&/g, "&").replace(/=$/, ""));
    }

    if (uiState.previewExhibitor) {
        historyReplace("?" + uiState.previewExhibitor.slug);
    }

    if (history.location.search.includes("&") || history.location.search.includes("%26")) {
        let search = history.location.search;
        search = search.startsWith("?") ? search.slice(1) : search;

        const delimiter = search.includes("&") ? "&" : "%26";
        const splittedUrl: string[] = search.split(delimiter);

        const newSearch = splittedUrl
            .map((url) => {
                const exhibitor = store.exhibitorStore.exhibitors.find((x: Exhibitor) => x.slug === url || x.externalId === url);
                return exhibitor ? exhibitor.name : url;
            })
            .join("&");

        historyReplace("?" + newSearch);
    }

    if (locationSearch.includes(KIOSK_SETUP_KEY)) {
        store.uiState.monochrome = true;
    }
}

export function initRouting(offHistory = false) {
    disableHistoryManipulation = offHistory;

    if (!disableHistoryManipulation && getHistoryUrl(history.location.search) === pathname) {
        routeHistory.push(getHistoryUrl(history.location.search));
    }

    unlisten = history.listen((location, action) => {
        if (disableHistoryManipulation) return;
        routeHistory.push(getHistoryUrl(location.search));

        logger.log("history", action, location);
        if (action === "POP") {
            dispatchFromUrl();
        }
    });

    processURLParams();
    executeCustomCommand();
    reaction(() => store.layerStore.layersLoaded,
        () => {
            dispatchFromUrl();
            autorun(setTitle);
            autorun(stateToUrl);
        }
    );
}

export function applyParameters(queryRaw: string = "") {
    historyReplace("?" + decodeURIComponent(queryRaw.toString()));

    if (!store.layerStore.layersLoaded) {
        executeCustomCommand();
        reaction(() => store.layerStore.layersLoaded,
            () => {
                processURLParams();
                dispatchFromUrl();
            }
        );
    } else {
        processURLParams();
        dispatchFromUrl();
    }
}

export function destroyHistory() {
    unlisten();
}

function setMapSettings(searchParams: URLSearchParams) {
    const MAP_SETTINGS_KEY = "expofp-map-settings";

    let result: MapSettings = {
        zoomtime: 2000,
    };

    try {
        const savedStr = localStorage?.getItem(MAP_SETTINGS_KEY);
        if (savedStr) {
            const saved = JSON.parse(savedStr);
            result = { ...result, ...castMapSettings(saved) };
        }
    } catch (err) {
        console.error("Failed to restore saved map settings.", err);
    }

    try {
        Object.keys(uiState.mapSettings)
            .forEach(key => !searchParams.has(key) && searchParams.delete(key));

        if (new Set(searchParams.keys()).size) {
            const params = castMapSettings(
                Object.fromEntries(searchParams.entries()),
            );
            result = { ...result, ...params };
            localStorage.setItem(MAP_SETTINGS_KEY, JSON.stringify(params));
        }
    } catch (err) {
        console.error("Failed to process or save map settings.", err);
    }

    uiState.setMapSettings(result);

    if (result.z) {
        const layer = store.layerStore.layers.find((l) => l.name === result.z);
        if (layer) {
            store.layerStore.updateVisibility(layer, true);
        }
    }
}

function castMapSettings(obj: Record<string, string>): MapSettings {
    const result: MapSettings = {};
    for (const prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            const value = obj[prop];
            result[prop] = (
                (
                    (prop === "zoomtime" || prop === "bearing" || prop === "zoom")
                    && typeof value === "string"
                    && /^-?\d+$/.test(value)

                )
                    ? parseInt(value, 10)
                    : value
            );
        }
    }
    return result;
}
