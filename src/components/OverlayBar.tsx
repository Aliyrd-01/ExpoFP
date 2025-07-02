import React, { forwardRef, MouseEvent, ReactNode } from "react";
import classNames from "classnames";

import store from "../store";
import { t } from "../utils/i18n";

import { OverlayBarBack } from "./";

import "./OverlayBar.scss";

const OverlayBar = forwardRef<
    HTMLDivElement,
    {
        scrolled: boolean;
        backMode: "back" | "menu" | "none";
        hideClose: boolean;
        overlayBarStyle?: React.CSSProperties;
        overlayBarCenterContent?: ReactNode;
        overlayBarEndContent?: ReactNode;
        onBack: () => void;
        onClose: () => void;
        children?: ReactNode;
    }
>(
    (
        {
            scrolled,
            backMode,
            hideClose,
            onBack,
            onClose,
            children,
            overlayBarCenterContent,
            overlayBarEndContent,
            overlayBarStyle,
        },
        ref,
    ) => {
        function handleClose(e: MouseEvent) {
            onClose();
        }

        return (
            <div style={overlayBarStyle} className={`overlay-bar ${classNames({ scrolled })}`} ref={ref} tabIndex={-1}>
                <OverlayBarBack
                    backMode={backMode || "menu"}
                    onBack={onBack}
                    hasSelectedCategories={store.uiState.selectedCategoryFilters.length > 0}
                />
                <div className="overlay-bar__slot">{children}</div>
                {overlayBarCenterContent}
                {hideClose ? (
                    <div className="overlay-bar__search-icon" aria-label={t("Search")}>
                        <i className="icon-search" aria-hidden="true"></i>
                    </div>
                ) : (
                    <div className="overlay-bar__close">
                        <button onClick={handleClose} title={t("Close")} aria-label={t("Close")}>
                            <i className="icon-close" aria-hidden="true"></i>
                        </button>
                    </div>
                )}
                {overlayBarEndContent}
            </div>
        );
    },
);

OverlayBar.displayName = "OverlayBar";

export default OverlayBar;
