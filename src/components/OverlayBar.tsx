import classNames from "classnames";
import React, { forwardRef, MouseEvent, ReactNode } from "react";
import "./OverlayBar.scss";
import OverlayBarBack from "./OverlayBarBack";
import { t } from "../utils/i18n";

const OverlayBar: React.FC<{
    scrolled: boolean;
    backMode: "back" | "menu" | "none";
    hideClose: boolean;
    overlayBarStyle?: React.CSSProperties;
    overlayBarCenterContent?: ReactNode;
    overlayBarEndContent?: ReactNode;
    onBack: () => void;
    onClose: () => void;
}> = ({
    scrolled,
    backMode,
    hideClose,
    onBack,
    onClose,
    children,
    overlayBarCenterContent,
    overlayBarEndContent,
    overlayBarStyle,
}) => {
    function handleClose(e: MouseEvent) {
        onClose();
    }

    return (
        <div style={overlayBarStyle} className={`overlay-bar ${classNames({ scrolled })}`} ref={ref}>
            <OverlayBarBack backMode={backMode || "menu"} onBack={onBack} />
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
});

OverlayBar.displayName = "OverlayBar";

export default OverlayBar;
