import data from "../../data";
import settings from "../../tools/settings";
import RootStore from "../RootStore";
import { ScheduleItem } from "../ScheduleStore";

export function iniSchedule(store: RootStore) {
    (data.events || [])
        .filter((e) => e.startDate)
        .forEach((event) => {
            const sI = new ScheduleItem(
                event.id,
                event.externalId,
                event.boothId,
                event.exhibitorId,
                event.name,
                event.description,
                event.startDate,
                event.endDate,
                event.link
            );
            store.scheduleStore.scheduleItems.push(sI);
        });
}
