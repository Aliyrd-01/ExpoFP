import { useObserver } from "mobx-react-lite";
import React from "react";
// import store from "../store";
import { useStore, useUiState } from "../tools/use";
// import store, { uiState } from "../store";
import "./Category.scss";
import List from "./List";
import OverlayContent from "./OverlayContent";

function Category() {
    const store = useStore();
    const uiState = useUiState();
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

export default () =>
    useObserver(() => {
        const uiState = useUiState();
        return !uiState.menu && !uiState.details && !!uiState.selectedCategory && <Category />;
    });
