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
        e.preventDefault();
        onClose();
    }

    return (
        <div className={`overlay-bar ${classNames({ scrolled })}`}>
            <OverlayBarBack backMode={backMode || "menu"} enableAnimation={true} onBack={onBack} />
            <div className="overlay-bar__slot">{children}</div>
            // eslint-disable-next-line
            {hideClose ? null : <a className="far fa-times overlay-bar__close" href="/#" onClick={handleClose} />}
        </div>
    );
};

export default OverlayBar;
