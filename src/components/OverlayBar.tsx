import classNames from "classnames";
import React, { MouseEvent, ReactNode } from "react";
import "./OverlayBar.scss";
import OverlayBarBack from "./OverlayBarBack";

const OverlayBar: React.FC<{
    scrolled: boolean;
    backMode: "back" | "menu" | "none";
    hideClose: boolean;
    overlayBarStyle?: React.CSSProperties;
    overlayBarEndContent?: ReactNode;
    onBack: () => void;
    onClose: () => void;
}> = ({ scrolled, backMode, hideClose, onBack, onClose, children, overlayBarEndContent, overlayBarStyle }) => {
    function handleClose(e: MouseEvent) {
        onClose();
    }

    // console.log('OverlayBar', { scrolled, backMode, hideClose, onBack, onClose, children })

    return (
        <div style={overlayBarStyle} className={`overlay-bar ${classNames({ scrolled })}`}>
            <OverlayBarBack backMode={backMode || "menu"} onBack={onBack} />
            <div className="overlay-bar__slot">{children}</div>
            {hideClose ? (
                <div className="overlay-bar__search-icon">
                    <i className="icon-search"></i>
                </div>
            ) : (
                <button className="overlay-bar__close" onClick={handleClose}>
                    <i className="icon-close"></i>
                </button>
            )}
            {overlayBarEndContent}
        </div>
    );
};

export default OverlayBar;
