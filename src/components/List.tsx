import { useLocalStore, useObserver } from "mobx-react-lite";
import React, { useEffect } from "react";
import data from "../data";
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

const n = Math.ceil((Math.max(window.innerHeight, window.innerWidth) - remsToPixels(3.5 + 2)) / remsToPixels(3.5));
logger.log("List n1:", n);


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
        const cls = `list-row ${index === uiState.activeListIndex ? "active" : ""}`;
        if (item instanceof Exhibitor && !data.hideCompanies) {
            return <ExhibitorRow exhibitor={item} key={`e${item.id}`} className={cls} />;
        } else if (item instanceof BoothBase) {
            return <BoothRow booth={item} key={`b${item.id}`} className={cls} />;
        } else if (item instanceof Category) {
            return <CategoryRow category={item} key={`c${item.id}`} className={cls} />;
        }
    }

    return useObserver(() => <div>{s.items.map(mapItem)}</div>);
}
