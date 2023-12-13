import { useObserver } from "mobx-react-lite";
import React, { useRef } from "react";
import data from "../data";
import store, { exhibitorStore, uiState } from "../store";
import { t } from "../utils/i18n";
import "./Bookmarks.scss";
import List from "./List";
import OverlayContent from "./OverlayContent";

function Bookmarks() {
    const scrollableRef = useRef<HTMLDivElement>();

    return useObserver(() => {
        const bar = (
            <div className="bar">
                {t("Bookmarks")}&nbsp;<span>({exhibitorStore.exhibitors.filter((e) => e.bookmarked).length})</span>
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
                <List updatedScrollableRef={scrollableRef} />
            </OverlayContent>
        );
    });

    function handleCloseBack() {
        store.selectSearch();
    }
}

export default () =>
    useObserver(() => !data.hideBookmarks && !uiState.details && uiState.list.type === "bookmarks" && <Bookmarks />);
