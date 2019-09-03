import React, { MouseEvent } from "react";
import "./OverlayBar.scss";
import classNames from "classnames";
import OverlayBarBack from "./OverlayBarBack";

const OverlayBar: React.FC<{
    scrolled: boolean;
    backMode: "back" | "menu" | "none";
    hideClose: boolean;
    onBack: () => void;
    onClose: () => void;
}> = ({ scrolled, backMode, hideClose, onBack, onClose, children }) => {
    function handleClose(e: MouseEvent) {
        onClose();
    }

    // console.log('OverlayBar', { scrolled, backMode, hideClose, onBack, onClose, children })

    return (
        <div className={`overlay-bar ${classNames({ scrolled })}`}>
            <OverlayBarBack backMode={backMode || "menu"} onBack={onBack} />
            <div className="overlay-bar__slot">{children}</div>
            {hideClose ? null : <button className="far fa-times overlay-bar__close" onClick={handleClose} />}
        </div>
    );
};

export default OverlayBar;
