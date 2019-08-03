import { useLocalStore, useObserver } from "mobx-react-lite";
import React, { useEffect } from "react";
import { uiState } from "../store";
import { Booth } from "../store/BoothStore";
import { Category } from "../store/CategoryStore";
import { Exhibitor } from "../store/ExhibitorStore";
import logger from "../tools/logger";
import { remsToPixels } from "../utils";
import ExhibitorRow from "./ExhibitorRow";

const n = Math.ceil((Math.max(window.innerHeight, window.innerWidth) - remsToPixels(3.5 + 2)) / remsToPixels(3.5));
logger.log("List n:", n);

export default function List() {
    const s = useLocalStore(() => ({
        get items() {
            if (uiState.overlayShowsAll || uiState.listItems.length <= n) return uiState.listItems;
            return uiState.listItems.slice(0, n);
        }
    }));

    useEffect(() => {
        const el = document.querySelector(".list-row.active");
        if (el) el.scrollIntoView({ block: "nearest", inline: "nearest" });
    }, []);

    function mapItem(item: Booth | Category | Exhibitor, index: number) {
        if (item instanceof Exhibitor) {
            return (
                <ExhibitorRow
                    exhibitor={item}
                    key={`e${item.id}`}
                    className={`list-row ${index === uiState.activeListIndex ? "active" : ""}`}
                />
            );
        }
    }

    return useObserver(() => <div>{s.items.map(mapItem)}</div>);
}
