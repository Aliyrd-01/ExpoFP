import { observer } from "mobx-react-lite";
import React, { RefObject, useEffect, useRef, useCallback } from "react";
import { Virtuoso } from "react-virtuoso";
import store, { boothStore, uiState } from "../store";
import settings from "../tools/settings";
import EntityListRow from "./EntityListRow";
import "./EntityList.scss";

const EXPOS_WITH_COMPACT_DETAILS = ["ipia2025"];

interface ListProps {
    updatedScrollableRef: RefObject<HTMLElement>;
    updateScroll?: () => void;
}

const EntityList = ({ updatedScrollableRef, updateScroll }: ListProps) => {
    const scrollerRef = useRef<HTMLElement | Window | null>(null);
    const listScrollItemId = uiState.listScrollItemId;
    const useCompactDetails = EXPOS_WITH_COMPACT_DETAILS.includes(settings.EXPO);

    useEffect(() => {
        setTimeout(() => {
            if (scrollerRef.current instanceof HTMLElement) {
                scrollerRef.current.scrollTop = uiState.listScrollTop;
            }
        }, 25);
    }, [uiState.listScrollTop]);

    const handleClick = useCallback((type: string, data: string) => {
        const id = parseInt(data, 10);
        uiState.setListScrollItemId(uiState.list?.type, id);
        uiState.setListScrollTop(
            uiState.list?.type,
            scrollerRef.current instanceof HTMLElement ? scrollerRef.current.scrollTop : 0
        );

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
                if (event?.boothId) {
                    store.selectBooth(boothStore.booths.find((b) => b.id === event.boothId));
                } else if (event?.exhibitorId) {
                    store.selectExhibitor(store.exhibitorStore.exhibitors.find((e) => e.id === event.exhibitorId));
                }
                break;
            }
        }
    }, []);

    return (
        <div style={{ height: "100%", cursor: "pointer", resize: "both", minHeight: 100 }}>
            {updatedScrollableRef && (
                <Virtuoso
                    className="list-virtual"
                    style={{ minHeight: uiState.listItems.length ? "1px" : 0 }}
                    data={uiState.listItems}
                    itemContent={(index, item) => {
                        const highlighted = listScrollItemId?.toString() === item.id?.toString();
                        return (
                            <EntityListRow
                                key={item.id}
                                item={item}
                                index={index}
                                highlighted={highlighted}
                                compactDetails={useCompactDetails}
                                onClick={handleClick}
                            />
                        );
                    }}
                    itemsRendered={() => updateScroll && setTimeout(updateScroll)}
                    totalListHeightChanged={() => updateScroll && updateScroll()}
                    customScrollParent={updatedScrollableRef.current}
                    totalCount={uiState.listItems.length}
                    overscan={400}
                    increaseViewportBy={400}
                    initialItemCount={Math.min(uiState.listScrollIndex + 1, uiState.listItems.length)}
                    components={{
                        EmptyPlaceholder: () => (
                            <div className="list-empty">
                                {uiState.list.type === "search" ? "Oops, nothing found" : "No items to show"}
                            </div>
                        ),
                    }}
                    scrollerRef={(ref) => {
                        scrollerRef.current = ref;
                    }}
                />
            )}
        </div>
    );
};

export default observer(EntityList);
