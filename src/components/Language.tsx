import { useObserver } from "mobx-react-lite";
import data from "../data";
import store, { uiState } from "../store";
import { t } from "../utils/i18n";
import "./Language.scss";
import List from "./List";
import OverlayContent from "./OverlayContent";
import React, { useRef } from "react";

export default function Language() {
    const scrollableRef = useRef<HTMLDivElement>();

    function handleCloseBack() {
        store.selectSearch();
    }

    return useObserver(
        () =>
            !data.hideLanguage &&
            !uiState.details &&
            uiState.list.type === "language" && (
                <OverlayContent
                    passScrollableRef={(ref) => {
                        scrollableRef.current = ref.current;
                    }}
                    onClose={handleCloseBack}
                    onBack={handleCloseBack}
                    backMode="menu"
                    bar={<div className="bar">{t("Language")}</div>}
                >
                    <List updatedScrollableRef={scrollableRef} />
                </OverlayContent>
            ),
    );
};
