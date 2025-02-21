import dateFormat from "dateformat";
import { useObserver } from "mobx-react-lite";
import React, { RefObject, useEffect, useRef, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import store, { boothStore, uiState } from "../store";
import { BoothBase } from "../store/BoothStore";
import { Category } from "../store/CategoryStore";
import { Exhibitor } from "../store/ExhibitorStore";
import { ScheduleItem } from "../store/ScheduleStore";
import type { ListItem } from "../store/types";
import EntityItem, { EntityItemType } from "./EntityItem";
import "./EntityList.scss";

interface ListProps {
    updatedScrollableRef: RefObject<HTMLElement>;
    updateScroll?: () => void;
}

export default function EntityList({ updatedScrollableRef, updateScroll }: ListProps) {
    const [scrollableRef, setScrollableRef] = useState<RefObject<HTMLElement>>(null);
    const listRef = useRef(null);

    useEffect(() => {
        setScrollableRef(updatedScrollableRef);
    }, [updatedScrollableRef]);

    useEffect(() => {
        const el = document.querySelector(".list-row.active");
        if (el) el.scrollIntoView({ block: "nearest", inline: "nearest" });
    }, []);

    function handleClick(type: EntityItemType, data: string) {
        const id = parseInt(data);

        switch (type) {
            case "exhibitor":
                store.clickExhibitor(store.exhibitorStore.exhibitors.find((e) => e.id === id));
                break;
            case "booth":
                store.clickBoothInList2(store.boothStore.booths.find((b) => b.id === id));
                break;
            case "category":
                store.clickCategory(store.categoryStore.categories.find((c) => c.id === id));
                break;
            case "event": {
                const event = store.scheduleStore.scheduleItems.find((e) => e.id === id);

                if (event.boothId) store.selectBooth(boothStore.booths.find((b) => b.id === event.boothId));
                else if (event.exhibitorId)
                    store.selectExhibitor(store.exhibitorStore.exhibitors.find((e) => e.id === event.exhibitorId));

                break;
            }
        }
    }

    const mapItem = ({ index }: { index: number }) => {
        const item: ListItem = uiState.listItems[index];
        if (item instanceof Exhibitor) {
            return (
                <EntityItem
                    onClick={handleClick}
                    id={item.id.toString()}
                    featured={item.featured}
                    url={null}
                    type="exhibitor"
                    image={item.logo}
                    title={item.name}
                    bookmarked={item.bookmarked}
                    additionalInfo={item.booths.map((booth) => ({
                        type: "location",
                        locationName: booth.name,
                        level: booth.layer?.name,
                    }))}
                />
            );
        } else if (item instanceof BoothBase) {
            return (
                <EntityItem
                    onClick={handleClick}
                    id={item.id.toString()}
                    type="booth"
                    title={item.name}
                    url={null}
                    additionalInfo={[{ type: "location", locationName: item.name, level: item.layer?.name }]}
                />
            );
        } else if (item instanceof Category) {
            return <EntityItem onClick={handleClick} id={item.id.toString()} type="category" title={item.name} url={null} />;
        } else if (item instanceof ScheduleItem) {
            const booth = item.boothId ? boothStore.booths.find((b) => b.id === item.boothId) : null;

            return (
                <EntityItem
                    onClick={handleClick}
                    id={item.id.toString()}
                    type="event"
                    title={item.name}
                    url={item.link}
                    date={dateFormat(item.startDate, "dd mmm ddd")}
                    time={`${dateFormat(item.startDate, "h:MM")} - ${dateFormat(item.endDate, "h:MM")}`}
                    additionalInfo={booth ? [{ type: "location", locationName: booth.name, level: booth.layer?.name }] : []}
                />
            );
        }
    };

    return useObserver(() => (
        <div style={{ height: "100%", cursor: "pointer" }}>
            {scrollableRef && (
                <Virtuoso
                    className="list-virtual"
                    style={{ minHeight: uiState.listItems.length ? "1px" : 0 }}
                    ref={listRef}
                    itemContent={(index) => mapItem({ index })}
                    itemsRendered={() => updateScroll && setTimeout(updateScroll)}
                    totalListHeightChanged={() => updateScroll && updateScroll()}
                    customScrollParent={scrollableRef.current}
                    totalCount={uiState.listItems.length}
                />
            )}
        </div>
    ));
}
