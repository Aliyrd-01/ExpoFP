import { useLocalStore, useObserver } from "mobx-react-lite";
import React, { CSSProperties, RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { uiState } from "../store";
import { Booth, BoothBase } from "../store/BoothStore";
import { Category } from "../store/CategoryStore";
import { Exhibitor } from "../store/ExhibitorStore";
import logger from "../tools/logger";
import { remsToPixels } from "../utils";
import BoothRow from "./BoothRow";
import CategoryRow from "./CategoryRow";
import ExhibitorRow from "./ExhibitorRow";
import "./List.scss";
import { List as VirtualList, CellMeasurer, CellMeasurerCache, AutoSizer } from "react-virtualized";
import { Virtuoso } from "react-virtuoso";
import PerfectScrollbar from "perfect-scrollbar";

type ScrollerProps = {
    style: CSSProperties;
};

const Scroller: any = React.forwardRef<any, any>(({ children, style, ...props }, ref) => {
    const ps = useRef<PerfectScrollbar>(null);

    useEffect(() => {
        if (!ref && (ref as any).current) return;
        ps.current = new PerfectScrollbar((ref as any).current, { minScrollbarLength: 25, wheelSpeed: 20 });
        return () => {
            ps.current.destroy();
        };
    }, [ref]);

    useEffect(() => {
        if (ps.current) {
            console.log("update");
            // setTimeout(() => ps.current.update());
        }
    }, [uiState.listItems]);

    return (
        <div style={{ ...style, height: "100%" }} ref={ref} {...props}>
            {children}
        </div>
    );
});

export default function List() {
    const listRef = useRef(null);

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

    return !uiState.overlayCollapsed ? (
        <div style={{ height: "100%" }}>
            <Virtuoso
                className="list-virtual"
                style={{ minHeight: uiState.listItems.length ? "1px" : 0 }}
                ref={listRef}
                data={uiState.listItems}
                itemContent={(index) => {
                    return mapItem({ index });
                }}
                components={{ Scroller } as any}
                defaultItemHeight={67}
                totalCount={uiState.listItems.length}
                initialTopMostItemIndex={uiState.activeListIndex}
            />
        </div>
    ) : null;
}
