import dateFormat from "dateformat";
import { observer } from "mobx-react-lite";
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
import data from "../data";

interface ListProps {
    updatedScrollableRef: RefObject<HTMLElement>;
    updateScroll?: () => void;
}

function EntityList({ updatedScrollableRef, updateScroll }: ListProps) {
    const [scrollableRef, setScrollableRef] = useState<RefObject<HTMLElement>>(null);
    const listRef = useRef(null);

    useEffect(() => {
        setScrollableRef(updatedScrollableRef);
    }, [updatedScrollableRef, store.layerStore.layersLoaded]);

    useEffect(() => {
        const el = document.querySelector(".list-row.active");
        if (el) el.scrollIntoView({ block: "nearest", inline: "nearest" });
    }, [store.layerStore.layersLoaded]);

    function handleClick(type: EntityItemType, data: string) {
        const id = parseInt(data);

        uiState.setListScrollItemId(uiState.list?.type, id);

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

    const mapItem = ({ index, listItems, listScrollItemId }: {
        index: number,
        listItems: ListItem[],
        listScrollItemId: number,
    }) => {
        const item: ListItem = listItems[index];
        const highlighted = listScrollItemId?.toString() === item.id?.toString();

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
                    visited={item.visited}
                    additionalInfo={item.booths.map((booth) => ({
                        type: "location",
                        locationName: booth.name,
                        level: data.shortLevelName ? booth.layer?.shortName : booth.layer?.description,
                    }))}
                    highlighted={highlighted}
                />
            );
        } else if (item instanceof BoothBase) {
            return (
                <EntityItem
                    locationTerm={data.boothTerm}
                    onClick={handleClick}
                    id={item.id.toString()}
                    type="booth"
                    title={item.name}
                    url={null}
                    icon={item.poiIcon}
                    additionalInfo={[{ type: "location", locationName: item.name, level: item.layer?.name }]}
                    highlighted={highlighted}
                />
            );
        } else if (item instanceof Category) {
            return (
                <EntityItem
                    onClick={handleClick}
                    id={item.id.toString()}
                    itemsCount={item.exhibitors.length}
                    type="category"
                    title={item.name}
                    url={null}
                    highlighted={highlighted}
                />
            );
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
                    highlighted={highlighted}
                />
            );
        }
    };

    const listScrollItemId = uiState.listScrollItemId;
    const listItems = uiState.listItems;

    return (
        <div style={{ height: "100%", cursor: "pointer" }}>
            {scrollableRef && (
                <Virtuoso
                    className="list-virtual"
                    style={{ minHeight: uiState.listItems.length ? "1px" : 0 }}
                    ref={listRef}
                    itemContent={(index) => mapItem({
                        index,
                        listItems,
                        listScrollItemId,
                    })}
                    itemsRendered={() => updateScroll && setTimeout(updateScroll)}
                    totalListHeightChanged={() => updateScroll && updateScroll()}
                    customScrollParent={scrollableRef.current}
                    totalCount={uiState.listItems.length}
                    initialTopMostItemIndex={uiState.listScrollIndex}
                    overscan={400}
                />
            )}
        </div>
    );
}

export default observer(EntityList);
