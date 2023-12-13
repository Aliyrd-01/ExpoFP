import { useObserver } from "mobx-react-lite";
import React, { RefObject, useEffect, useRef, useState } from "react";
import { uiState } from "../store";
import { Booth, BoothBase } from "../store/BoothStore";
import { Category } from "../store/CategoryStore";
import { Exhibitor } from "../store/ExhibitorStore";
import BoothRow from "./BoothRow";
import CategoryRow from "./CategoryRow";
import ExhibitorRow from "./ExhibitorRow";
import "./List.scss";
import { Virtuoso } from "react-virtuoso";

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
        const item: Exhibitor | Booth | Category = uiState.listItems[index];
        const cls = `list-row ${index === uiState.activeListIndex ? "active" : ""}`;
        if (item instanceof Exhibitor) {
            return <ExhibitorRow key={index} exhibitor={item} className={cls} />;
        } else if (item instanceof BoothBase) {
            return <BoothRow key={index} className={cls} booth={item} />;
        } else if (item instanceof Category) {
            return <CategoryRow key={index} className={cls} category={item} />;
        }
    };

    return useObserver(() => (
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
                />
            )}
        </div>
    ));
}
