import { autorun } from "mobx";
import data from "../../data";
import { isLocalStorageAvailable } from "../../utils/localStorage";
import logger from "../../tools/logger";
import settings from "../../tools/settings";
import { EventItem } from "../EventStore";
import RootStore from "../RootStore";

export default function initEvents(store: RootStore) {
    data.events?.forEach((e) => {
        const eI = new EventItem(
            e.id,
            e.externalId,
            e.boothId,
            e.exhibitorId,
            e.name,
            e.description,
            e.startDate,
            e.endDate,
            e.link
        );
        store.eventStore.eventItems.push(eI);
    });

    // dispose
    logger.log("initEvents", store.eventStore.eventItems.length);

    initBookmarked(store.eventStore);
}

function initBookmarked(eventStore: any) {
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

    eventStore.replaceBookmarked(bookmarkedAr);

    autorun(() => {
        saveToLocalStorage(eventStore.bookmarked.map((x) => x.id));
    });
}

function getFromLocalStorage() {
    if (!isLocalStorageAvailable) return [];

    let ls = localStorage.getItem(`${settings.EXPO}-events-bookmarked`);
    if (!ls) ls = localStorage.getItem("events-bookmarked");
    return ls ? (JSON.parse(ls) as number[]) : [];
}

function saveToLocalStorage(ar: number[]) {
    if (!isLocalStorageAvailable) return;

    logger.log("saveEventsToLocalStorage", ar.length);
    localStorage.setItem(`${settings.EXPO}-events-bookmarked`, JSON.stringify(ar));
}
