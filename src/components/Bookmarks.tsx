import { useObserver } from "mobx-react-lite";
import React, { useRef } from "react";
import data from "../data";
import store, { exhibitorStore, uiState } from "../store";
import { t } from "../utils/i18n";
import { OverlayContent, EntityList } from "./";
import "./Bookmarks.scss";

function Bookmarks() {
    const scrollableRef = useRef<HTMLDivElement>();

    return useObserver(() => {
        const bar = (
            <div className="efp-bar">
                {t("Bookmarks")}&nbsp;
                <span>({exhibitorStore.exhibitors.filter((e) => e.bookmarked).length + store.eventStore.bookmarked.length})</span>
            </div>
        );

        return (
            <OverlayContent
                passScrollableRef={(ref) => {
                    scrollableRef.current = ref.current;
                }}
                onClose={handleCloseBack}
                onBack={handleCloseBack}
                backMode="menu"
                bar={bar}
            >
                <EntityList updatedScrollableRef={scrollableRef} />
            </OverlayContent>
        );
    });

    function handleCloseBack() {
        store.selectSearch();
    }
}

export default () =>
    useObserver(() => !data.hideBookmarks && !uiState.details && uiState.list.type === "bookmarks" && <Bookmarks />);
