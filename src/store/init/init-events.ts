import data from "../../data";
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
}
