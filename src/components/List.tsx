import { useLocalStore, useObserver } from "mobx-react-lite";
import React, { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
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

const n = Math.ceil(
    (Math.max(uiState.rootElement.clientHeight, uiState.rootElement.clientWidth) - remsToPixels(3.5 + 2)) / remsToPixels(3.5)
);
logger.log("List n1:", n);

export default function List() {
    const items = useMemo(() => {
        if (uiState.overlayShowsAll || uiState.listItems.length <= n) return uiState.listItems;
        return uiState.listItems.slice(0, n);
    }, [uiState.overlayShowsAll, uiState.listItems, n]);

    const listRef = useRef();
    window["listRef"] = listRef;

    const cache = new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: 67,
    });

    useEffect(() => {
        const el = document.querySelector(".list-row.active");
        if (el) el.scrollIntoView({ block: "nearest", inline: "nearest" });
    }, []);

    function mapItem({ index, key, style, parent }: { index: number; key: any; style: any; parent: any }) {
        const item: Exhibitor | Booth | Category = items[index];
        const cls = `list-row ${index === uiState.activeListIndex ? "active" : ""}`;
        if (item instanceof Exhibitor) {
            return (
                <CellMeasurer key={key} cache={cache} columnIndex={0} rowIndex={index} parent={parent}>
                    <div key={key} style={style}>
                        <ExhibitorRow exhibitor={item} className={cls} />
                    </div>
                </CellMeasurer>
            );
        } else if (item instanceof BoothBase) {
            return (
                <CellMeasurer key={key} cache={cache} columnIndex={0} rowIndex={index} parent={parent}>
                    <div key={key} style={style} className={cls}>
                        <BoothRow className={cls} booth={item} />
                    </div>
                </CellMeasurer>
            );
        } else if (item instanceof Category) {
            return (
                <CellMeasurer key={key} cache={cache} columnIndex={0} rowIndex={index} parent={parent}>
                    <div key={key} style={style} className={cls}>
                        <CategoryRow className={cls} category={item} />
                    </div>
                </CellMeasurer>
            );
        }
    }

    return !uiState.overlayCollapsed ? (
        <div style={{ height: "100%" }}>
            <AutoSizer>
                {({ width, height }) => (
                    <>
                        <VirtualList
                            // style={{ overflow: "unset" }}
                            ref={listRef}
                            width={width}
                            height={height}
                            rowCount={items.length}
                            rowHeight={cache.rowHeight}
                            deferredMeasurementCache={cache}
                            rowRenderer={mapItem}
                        />
                    </>
                )}
            </AutoSizer>
        </div>
    ) : null;

    // return useObserver(() => <div>{s.items.map(mapItem)}</div>);
}
