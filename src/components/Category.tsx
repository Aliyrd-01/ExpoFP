import React, { useRef } from "react";
import { useObserver } from "mobx-react-lite";

import store, { uiState } from "../store";
import { Category as CategoryModel } from "../store/CategoryStore";
import { t } from "../utils/i18n";

import { EntityList, OverlayContent } from "./";

import "./Category.scss";

function Category() {
    const scrollableRef = useRef<HTMLDivElement>();

    return useObserver(() => {
        const bar = (
            <div className="efp-bar">
                {uiState.selectedCategory.name}&nbsp;<span>({uiState.selectedCategory.exhibitors.length})</span>
                <div className="efp-note">{t("Category")}</div>
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
    useObserver(() => !uiState.menu && !!uiState.selectedCategory && uiState.details instanceof CategoryModel && <Category />);
