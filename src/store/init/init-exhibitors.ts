import { autorun } from "mobx";
import data from "../../data";
import baseUrl from "../../tools/base-data-url";
import logger from "../../tools/logger";
import { generateUniqueSlug } from "../../tools/slug";
import previewExhibitor from "../../utils/preview-exhibitor";
import ExhibitorStore, { Exhibitor } from "../ExhibitorStore";
import RootStore from "../RootStore";
import settings from "../../tools/settings";

export default function initExhibitors(store: RootStore) {
    if (previewExhibitor) {
        const i = data.exhibitors.findIndex((e) => e.id === previewExhibitor.id);
        if (i !== -1) data.exhibitors.splice(i, 1, previewExhibitor);
        else data.exhibitors.push(previewExhibitor);
    }

    data.exhibitors.sort(function (a: RawExhibitor, b: RawExhibitor) {
        var x = (a.featured ? "0" : "1") + a.name.toLowerCase();
        var y = (b.featured ? "0" : "1") + b.name.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });

    const { exhibitorStore } = store;

    for (const raw of data.exhibitors || []) {
        const e = new Exhibitor() as MutableRequired<Exhibitor>;
        Object.assign(e, raw);

        e.slug = generateUniqueSlug(e.name);

        e.logo = addBaseUrl(e.logo);
        if (e.gallery) e.gallery = e.gallery.map((url) => addBaseUrl(url));
        if (e.marketMaterials) 
            e.marketMaterials = e.marketMaterials.map((mm) => { 
                return {
                    fileName: mm.fileName,
                    path: addBaseUrl(mm.path) 
                }});
        e.leadingImageUrl = addBaseUrl(e.leadingImageUrl);
        e.categories = [];
        e.booths = [];
        for (const c of raw.categories || []) {
            const ca = store.categoryStore.categoryById.get(c);
            e.categories.push(ca);
            ca.exhibitors.push(e as Exhibitor);
        }

        (e["store"] as ExhibitorStore) = exhibitorStore;
        exhibitorStore.exhibitors.push(e as Exhibitor);
    }

    // dispose
    delete data.exhibitors;
    logger.log("initExhibitors", exhibitorStore.exhibitors.length);

    initBookmarked(exhibitorStore);
}

function initBookmarked(exhibitorStore: ExhibitorStore) {
    let bookmarkedAr: number[];

    const url = new URL(window.location.href);
    const c = url.searchParams.get("b");
    const ca = url.searchParams.get("ba");
    const combined = c || ca;
    if (combined) {
        bookmarkedAr = combined
            .split("|")
            .map((x) => parseInt(x))
            .filter((x) => x);

        const append = !!ca;
        if (append) bookmarkedAr.push(...getFromLocalStorage());
        saveToLocalStorage(bookmarkedAr);
    } else {
        bookmarkedAr = getFromLocalStorage();
    }

    exhibitorStore.replaceBookmarked(bookmarkedAr);

    autorun(() => {
        saveToLocalStorage(exhibitorStore.bookmarked.map((x) => x.id));
    });
}

function getFromLocalStorage() {
    let ls = localStorage.getItem(`${settings.EXPO}-bookmarked`);
    if (!ls) ls = localStorage.getItem("bookmarked");
    return ls ? (JSON.parse(ls) as number[]) : [];
}

function saveToLocalStorage(ar: number[]) {
    logger.log("saveToLocalStorage", ar.length);
    // const dest = [...ar, ...(append ? getFromLocalStorage() : [])];
    // const unique = Array.from(new Set(dest));
    // debugger
    localStorage.setItem(`${settings.EXPO}-bookmarked`, JSON.stringify(ar));
}

function addBaseUrl(url: string) {
    if (url && url.indexOf("://") === -1) return baseUrl + url;
    else return url;
}
