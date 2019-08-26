import React from "react";
import { useObserver } from "mobx-react-lite";
import store, { uiState, exhibitorStore } from "../store";
import OverlayContent from "./OverlayContent";
import List from "./List";
import "./Bookmarks.scss";

function Bookmarks() {
    return useObserver(() => {
        const bar = (
            <div className="bar">
                Bookmarks&nbsp;<span>({exhibitorStore.bookmarked.length})</span>
            </div>
        );

        return (
            <OverlayContent onClose={handleCloseBack} onBack={handleCloseBack} backMode="menu" bar={bar}>
                <List />
            </OverlayContent>
        );
    });

    function handleCloseBack() {
        store.selectSearch();
    }
}

export default () => useObserver(() => !uiState.details && uiState.list.type === "bookmarks" && <Bookmarks />);
