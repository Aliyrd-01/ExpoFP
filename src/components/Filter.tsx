import { useObserver } from "mobx-react-lite";
import React, { useRef } from "react";
import store, { uiState } from "../store";
import List from "./List";
import OverlayContent from "./OverlayContent";
import { FilterType } from "../store/types";
import { t } from "../utils/i18n";

function Filter() {
    const scrollableRef = useRef<HTMLDivElement>();

    return useObserver(() => {
        const list = uiState.list as FilterType;

        const bar = (
            <div className="bar">
                {t(`${list.query.key.charAt(0).toUpperCase()}${list.query.key.slice(1)}`)}&nbsp;<span>({list.items.length})</span>
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

export default () => useObserver(() => uiState.list.type === "filter" && <Filter />);
