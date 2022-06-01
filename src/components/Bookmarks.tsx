import { useObserver } from "mobx-react-lite";
import React from "react";
import store, { exhibitorStore, uiState } from "../store";
import { t } from "../utils/i18n";
import "./Bookmarks.scss";
import List from "./List";
import OverlayContent from "./OverlayContent";

function Bookmarks() {
    return useObserver(() => {
        const bar = (
            <div className="bar">
                {t("Bookmarks")}&nbsp;<span>({exhibitorStore.exhibitors.filter((e) => e.bookmarked).length})</span>
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
