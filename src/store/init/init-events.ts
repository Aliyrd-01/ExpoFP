import { autorun } from "mobx";
import data from "../../data";
import { isLocalStorageAvailable } from "../../utils/localStorage";
import logger from "../../tools/logger";
import settings from "../../tools/settings";
import { EventItem } from "../EventStore";
import RootStore from "../RootStore";
import store from "../index";

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
        const allIds = combined
            .split("|")
            .map((x) => parseInt(x))
            .filter((x) => x);

        const exhibitorIds = allIds.filter((id) => store.exhibitorStore.exhibitors.some((e) => e.id === id));
        const eventIds = allIds.filter((id) => eventStore.eventItems.some((e) => e.id === id));

        const append = !!ca;
        if (append) {
            const existing = getFromLocalStorage();
            exhibitorIds.push(...existing.exhibitors);
            eventIds.push(...existing.events);
        }
        saveToLocalStorage({ exhibitors: exhibitorIds, events: eventIds });
        bookmarkedAr = eventIds;
    } else {
        const bookmarks = getFromLocalStorage();
        bookmarkedAr = bookmarks.events;
    }

    eventStore.replaceBookmarked(bookmarkedAr);

    autorun(() => {
        const currentBookmarks = getFromLocalStorage();
        saveToLocalStorage({
            exhibitors: currentBookmarks.exhibitors,
            events: eventStore.bookmarked.map((x) => x.id),
        });
    });
}

function getFromLocalStorage() {
    if (!isLocalStorageAvailable) return { exhibitors: [], events: [] };

    let ls = localStorage.getItem(`${settings.EXPO}-bookmarked`);
    if (!ls) ls = localStorage.getItem("bookmarked");

    if (!ls) return { exhibitors: [], events: [] };

    try {
        const parsed = JSON.parse(ls);

        if (Array.isArray(parsed)) {
            const migrated = { exhibitors: parsed, events: [] };
            localStorage.setItem(`${settings.EXPO}-bookmarked`, JSON.stringify(migrated));
            return migrated;
        }

        return parsed as { exhibitors: number[]; events: number[] };
    } catch (e) {
        return { exhibitors: [], events: [] };
    }
}

function saveToLocalStorage(ar: { exhibitors: number[]; events: number[] }) {
    if (!isLocalStorageAvailable) return;

    logger.log("saveEventsToLocalStorage", ar.events.length);
    localStorage.setItem(`${settings.EXPO}-bookmarked`, JSON.stringify(ar));
}
