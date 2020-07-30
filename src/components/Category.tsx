import { useObserver } from "mobx-react-lite";
import React from "react";
import store, { uiState } from "../store";
import "./Category.scss";
import List from "./List";
import OverlayContent from "./OverlayContent";
import { t } from "../utils/i18n";

function Category() {
    return useObserver(() => {
        const bar = (
            <div className="bar">
                {uiState.selectedCategory.name}&nbsp;<span>({uiState.selectedCategory.exhibitors.length})</span>
                <div className="note">{t("Category")}</div>
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

export default () => useObserver(() => !uiState.menu && !uiState.details && !!uiState.selectedCategory && <Category />);
