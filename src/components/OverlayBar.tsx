import classNames from "classnames";
import React, { forwardRef, MouseEvent, ReactNode } from "react";
import "./OverlayBar.scss";
import OverlayBarBack from "./OverlayBarBack";

const OverlayBar = forwardRef<
    HTMLDivElement,
    {
        scrolled: boolean;
        backMode: "back" | "menu" | "none";
        hideClose: boolean;
        overlayBarStyle?: React.CSSProperties;
        overlayBarEndContent?: ReactNode;
        onBack: () => void;
        onClose: () => void;
        children?: ReactNode;
    }
>(({ scrolled, backMode, hideClose, onBack, onClose, children, overlayBarEndContent, overlayBarStyle }, ref) => {
    function handleClose(e: MouseEvent) {
        onClose();
    }

    return (
        <div style={overlayBarStyle} className={`overlay-bar ${classNames({ scrolled })}`} ref={ref}>
            <OverlayBarBack backMode={backMode || "menu"} onBack={onBack} />
            <div className="overlay-bar__slot">{children}</div>
            {hideClose ? (
                <div className="overlay-bar__search-icon">
                    <i className="icon-search"></i>
                </div>
            ) : (
                <div className="overlay-bar__close">
                    <button onClick={handleClose}>
                        <i className="icon-close"></i>
                    </button>
                </div>
            )}
            {overlayBarEndContent}
        </div>
    );
});

OverlayBar.displayName = "OverlayBar";

export default OverlayBar;
