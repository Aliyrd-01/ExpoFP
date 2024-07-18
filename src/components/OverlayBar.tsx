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
                    <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12.8333 4.73524C8.36091 4.73524 4.7353 8.36085 4.7353 12.8333C4.7353 17.3057 8.36091 20.9313 12.8333 20.9313C17.3058 20.9313 20.9314 17.3057 20.9314 12.8333C20.9314 8.36085 17.3058 4.73524 12.8333 4.73524ZM2.26471 12.8333C2.26471 6.99638 6.99645 2.26465 12.8333 2.26465C18.6702 2.26465 23.402 6.99638 23.402 12.8333C23.402 18.6702 18.6702 23.4019 12.8333 23.4019C6.99645 23.4019 2.26471 18.6702 2.26471 12.8333Z"
                        />
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M18.5515 18.5515C19.0339 18.069 19.8161 18.069 20.2985 18.5515L25.3735 23.6265C25.8559 24.1089 25.8559 24.891 25.3735 25.3734C24.8911 25.8558 24.1089 25.8558 23.6265 25.3734L18.5515 20.2984C18.0691 19.816 18.0691 19.0339 18.5515 18.5515Z"
                        />
                    </svg>
                </div>
            ) : (
                <button className="far fa-times overlay-bar__close" onClick={handleClose} />
            )}
            {overlayBarEndContent}
        </div>
    );
};

export default OverlayBar;
