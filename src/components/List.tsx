import { useObserver } from "mobx-react-lite";
import React, { RefObject, useEffect, useRef, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import { uiState } from "../store";
import "./List.scss";
import { HeatmapYah } from "../store/HeatmapStore";
import YahRow from "./YahRow";
import { Language } from "../store/LanguageStore";
import type { ListItem } from "../store/types";
import LanguageRow from "./LanguageRow";
import "./List.scss";

interface ListProps {
    updatedScrollableRef: RefObject<HTMLElement>;
    updateScroll?: () => void;
}

export default function List({ updatedScrollableRef, updateScroll }: ListProps) {
    const [scrollableRef, setScrollableRef] = useState<RefObject<HTMLElement>>(null);
    const listRef = useRef(null);

    useEffect(() => {
        setScrollableRef(updatedScrollableRef);
    }, [updatedScrollableRef]);

    useEffect(() => {
        const el = document.querySelector(".list-row.active");
        if (el) el.scrollIntoView({ block: "nearest", inline: "nearest" });
    }, []);

    const mapItem = ({ index }: { index: number }) => {
        const item: ListItem = uiState.listItems[index];
        const cls = `list-row ${index === uiState.activeListIndex ? "active" : ""}`;

        if (item instanceof Language) {
            return <LanguageRow key={index} item={item} />;
        } else if (item instanceof HeatmapYah) {
            return <YahRow key={index} yah={item} className={cls} />
        } else {
            throw new Error("Invalid item type");
        }
    };

    return useObserver(() => {
        const selectedIndex = uiState.listItems.findIndex(i => (i as Language).selected);

        return (
            <div style={{ height: "100%" }}>
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
                        initialTopMostItemIndex={selectedIndex !== -1 ? selectedIndex : 0}
                    />
                )}
            </div>
        );
    });
}
