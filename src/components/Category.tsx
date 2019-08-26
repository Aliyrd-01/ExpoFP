import React from "react";
import { useObserver } from "mobx-react-lite";
import store, { uiState } from "../store";
import OverlayContent from "./OverlayContent";
import List from "./List";
import './Category.scss'

function Category() {
    return useObserver(() => {
        const bar = (
            <div className="bar">
                {uiState.selectedCategory.name}&nbsp;<span>({uiState.selectedCategory.exhibitors.length})</span>
                <div className="note">Category</div>
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
