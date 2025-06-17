import React from "react";
import dateFormat from "dateformat";
import store, { boothStore, exhibitorStore } from "../store";
import { EventItem } from "../store/EventStore";
import SimpleRow from "./SimpleRow";

const EventItemRow: React.FC<{
    item: EventItem;
    className: string;
}> = ({ item, className }) => {
    const booth = item.boothId ? boothStore.booths.find((b) => b.id === item.boothId) : null;
    const exhibitor = item.exhibitorId ? exhibitorStore.exhibitors.find((e) => e.id === item.exhibitorId) : null;

    return (
        <SimpleRow
            className={className}
            slug={item.name}
            onClick={handleClick}
            line1={item.name}
            line2={`${dateFormat(item.startDate, "dd mmm ddd")}. ${dateFormat(item.startDate, "h:MM")} - ${dateFormat(
                item.endDate,
                "h:MM"
            )}`}
        />
    );

    function handleClick() {
        if (item.boothId) store.selectBooth(boothStore.booths.find((b) => b.id === item.boothId));
        else if (item.exhibitorId) store.selectExhibitor(exhibitorStore.exhibitors.find((e) => e.id === item.exhibitorId));
    }
};

export default EventItemRow;
