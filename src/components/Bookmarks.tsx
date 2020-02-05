import React from "react";
import { useObserver } from "mobx-react-lite";
// import store, { uiState, exhibitorStore } from "../store";
import OverlayContent from "./OverlayContent";
import List from "./List";
import "./Bookmarks.scss";
import { useExhibitorStore, useUiState, useStore } from "../tools/use";

function Bookmarks() {
    const exhibitorStore = useExhibitorStore();
    const store = useStore();

    return useObserver(() => {
        const bar = (
            <div className="bar">
                Bookmarks&nbsp;<span>({exhibitorStore.bookmarkedIds.size})</span>
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

export default () =>
    useObserver(() => {
        const uiState = useUiState();

        return !uiState.details && uiState.list.type === "bookmarks" && <Bookmarks />;
    });
