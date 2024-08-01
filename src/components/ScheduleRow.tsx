import dateFormat from "dateformat";
import React from "react";
import store, { boothStore, exhibitorStore } from "../store";
import { ScheduleItem } from "../store/ScheduleStore";
import "./CategoryRow.scss";
import SimpleRow from "./SimpleRow";

const ScheduleItemRow: React.FC<{
    item: ScheduleItem;
    className: string;
}> = ({ item, className }) => {
    return (
        <SimpleRow
            className={className}
            slug={item.name}
            onClick={handleClick}
            line1={`${item.name}`}
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

export default ScheduleItemRow;
