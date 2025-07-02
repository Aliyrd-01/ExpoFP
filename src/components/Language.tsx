import React, { useRef } from "react";
import { observer } from "mobx-react-lite";

import data from "../data";
import store, { uiState } from "../store";
import { t } from "../utils/i18n";

import { List, OverlayContent } from "./";

const Language = observer(() => {
    const scrollableRef = useRef<HTMLDivElement>();
    const handleCloseBack = () => store.selectSearch();
    return (
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
                bar={<div className="efp-bar efp-bar--language">{t("Language")}</div>}
            >
                <List updatedScrollableRef={scrollableRef} />
            </OverlayContent>
        )
    );
});

export default Language;
