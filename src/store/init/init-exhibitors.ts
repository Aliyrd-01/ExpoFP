import RootStore from "../RootStore";
import logger from "../../tools/logger";
// import data from '../../data';
import ExhibitorStore, { Exhibitor } from "../ExhibitorStore";
import { generateUniqueSlug } from "../../tools/slug";
import { autorun } from "mobx";
import previewExhibitor from "../../utils/preview-exhibitor";

export default function initExhibitors(store: RootStore) {
    const data = store.fp.data;
    if (previewExhibitor) {
        const i = data.exhibitors.findIndex(e => e.id === previewExhibitor.id);
        if (i !== -1) data.exhibitors.splice(i, 1, previewExhibitor);
        else data.exhibitors.push(previewExhibitor);
    }

    data.exhibitors.sort(function(a: RawExhibitor, b: RawExhibitor) {
        var x = (a.featured ? "0" : "1") + a.name.toLowerCase();
        var y = (b.featured ? "0" : "1") + b.name.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });

    const { exhibitorStore } = store;

    for (const raw of data.exhibitors || []) {
        const e = new Exhibitor() as MutableRequired<Exhibitor>;
        Object.assign(e, raw);

        e.slug = generateUniqueSlug(e.name);

        if (e.logo) e.logo = store.fp.dataUrl + e.logo;
        e.categories = [];
        // e.booths = [];
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
            .map(x => parseInt(x))
            .filter(x => x);

        const append = !!ca;
        if (append) bookmarkedAr.push(...getFromLocalStorage());
        saveToLocalStorage(bookmarkedAr);
    } else {
        bookmarkedAr = getFromLocalStorage();
    }

    exhibitorStore.replaceBookmarked(bookmarkedAr);

    autorun(() => {
        saveToLocalStorage(Array.from(exhibitorStore.bookmarked));
    });
}

function getFromLocalStorage() {
    const ls = localStorage.getItem("bookmarked");
    return ls ? (JSON.parse(ls) as number[]) : [];
}

function saveToLocalStorage(ar: number[]) {
    logger.log("saveToLocalStorage", ar.length);
    // const dest = [...ar, ...(append ? getFromLocalStorage() : [])];
    // const unique = Array.from(new Set(dest));
    // debugger
    localStorage.setItem("bookmarked", JSON.stringify(ar));
}
