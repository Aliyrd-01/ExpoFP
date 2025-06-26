import { autorun } from "mobx";
import data from "../../data";
import baseUrl from "../../tools/base-data-url";
import logger from "../../tools/logger";
import { generateUniqueSlug } from "../../tools/slug";
import previewExhibitor from "../../utils/preview-exhibitor";
import ExhibitorStore, { Exhibitor } from "../ExhibitorStore";
import RootStore from "../RootStore";
import settings from "../../tools/settings";
import { isLocalStorageAvailable } from "../../utils/localStorage";
import store from "../index";

export default function initExhibitors(store: RootStore) {
    if (previewExhibitor) {
        const i = data.exhibitors.findIndex((e) => e.id === previewExhibitor.id);
        if (i !== -1) data.exhibitors.splice(i, 1, previewExhibitor);
        else data.exhibitors.push(previewExhibitor);
    }

    /// TODO: remove this
    // data.exhibitors.sort(function (a: RawExhibitor, b: RawExhibitor) {
    //     var x = (a.featured ? "0" : "1") + a.name.toLowerCase();
    //     var y = (b.featured ? "0" : "1") + b.name.toLowerCase();
    //     return x < y ? -1 : x > y ? 1 : 0;
    // });

    const { exhibitorStore } = store;

    for (const raw of data.exhibitors || []) {
        const e = new Exhibitor() as MutableRequired<Exhibitor>;
        Object.assign(e, raw);
        e.slug = generateUniqueSlug(e.name);
        e.rebookingState = e.rebookingState || 0;
        e.logo = addBaseUrl(e.logo);

        if (e.gallery) e.gallery = e.gallery.map((url) => addBaseUrl(url));
        if (e.marketMaterials)
            e.marketMaterials = e.marketMaterials.map((mm) => {
                return {
                    fileName: mm.fileName,
                    path: addBaseUrl(mm.path),
                };
            });
        e.leadingImageUrl = addBaseUrl(e.leadingImageUrl);
        e.categories = [];
        e.booths = [];
        //e.logoInBooth = true;

        (e["store"] as ExhibitorStore) = exhibitorStore;
        exhibitorStore.exhibitors.push(e as Exhibitor);
        const schedule = store.eventStore.eventItems.filter((s) => s.exhibitorId === e.id);
        e.schedule = schedule.length ? schedule : null;
    }

    // dispose
    logger.log("initExhibitors", exhibitorStore.exhibitors.length);

    initBookmarked(exhibitorStore);
    initVisited(exhibitorStore);
}

function initBookmarked(exhibitorStore: ExhibitorStore) {
    let bookmarkedAr: number[];

    const url = new URL(window.location.href);
    const c = url.searchParams.get("b");
    const ca = url.searchParams.get("ba");
    const combined = c || ca;
    if (combined) {
        const allIds = combined
            .split("|")
            .map((x) => parseInt(x))
            .filter((x) => x);

        // Разделяем ID на exhibitors и events
        const exhibitorIds = allIds.filter((id) => exhibitorStore.exhibitors.some((e) => e.id === id));
        const eventIds = allIds.filter((id) => store.eventStore.eventItems.some((e) => e.id === id));

        const append = !!ca;
        if (append) {
            const existing = getFromLocalStorage();
            exhibitorIds.push(...existing.exhibitors);
            eventIds.push(...existing.events);
        }
        saveToLocalStorage({ exhibitors: exhibitorIds, events: eventIds });
        bookmarkedAr = exhibitorIds;
    } else {
        const bookmarks = getFromLocalStorage();
        bookmarkedAr = bookmarks.exhibitors;
    }

    exhibitorStore.replaceBookmarked(bookmarkedAr);

    autorun(() => {
        const currentBookmarks = getFromLocalStorage();
        saveToLocalStorage({
            exhibitors: exhibitorStore.bookmarked.map((x) => x.id),
            events: currentBookmarks.events,
        });
    });
}

function initVisited(exhibitorStore: ExhibitorStore) {
    const visitedAr: number[] = getVisitedFromLocalStorage();
    exhibitorStore.replaceVisited(visitedAr);

    autorun(() => {
        saveVisitedToLocalStorage(exhibitorStore.visited.map((x) => x.id));
    });
}

function getFromLocalStorage() {
    if (!isLocalStorageAvailable) return { exhibitors: [], events: [] };

    let ls = localStorage.getItem(`${settings.EXPO}-bookmarked`);
    if (!ls) ls = localStorage.getItem("bookmarked");

    if (!ls) return { exhibitors: [], events: [] };

    try {
        const parsed = JSON.parse(ls);

        // Миграция: если это старый формат (массив чисел), конвертируем в новый
        if (Array.isArray(parsed)) {
            const migrated = { exhibitors: parsed, events: [] };
            localStorage.setItem(`${settings.EXPO}-bookmarked`, JSON.stringify(migrated));
            return migrated;
        }

        // Новый формат
        return parsed as { exhibitors: number[]; events: number[] };
    } catch (e) {
        return { exhibitors: [], events: [] };
    }
}

function getVisitedFromLocalStorage() {
    if (!isLocalStorageAvailable) return [];

    let ls = localStorage.getItem(`${settings.EXPO}-visited`);
    if (!ls) ls = localStorage.getItem("visited");
    return ls ? (JSON.parse(ls) as number[]) : [];
}

function saveToLocalStorage(ar: { exhibitors: number[]; events: number[] }) {
    if (!isLocalStorageAvailable) return;

    logger.log("saveToLocalStorage", ar.exhibitors.length);
    localStorage.setItem(`${settings.EXPO}-bookmarked`, JSON.stringify(ar));
}

function saveVisitedToLocalStorage(ar: number[]) {
    if (!isLocalStorageAvailable) return;

    logger.log("saveVisitedToLocalStorage", ar.length);
    localStorage.setItem(`${settings.EXPO}-visited`, JSON.stringify(ar));
}

function addBaseUrl(url: string) {
    if (url && url.indexOf("://") === -1) return baseUrl + url;
    else return url;
}
