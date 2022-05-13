import React, { MouseEvent } from "react";
import "./OverlayBar.scss";
import classNames from "classnames";
import OverlayBarBack from "./OverlayBarBack";
import store, { uiState } from "../store";
import isMobile from "../utils/is-mobile";

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

    function handleShare() {
        let navigator = window.navigator as any;
        const data = {
            title: uiState.selectedExhibitor.name,
            url: window.location.href,
        };

        if (isMobile() && navigator.canShare(data)) {
            navigator.share(data);
        } else {
            store.toggleModal("share");
        }
    }

    // console.log('OverlayBar', { scrolled, backMode, hideClose, onBack, onClose, children })

    return (
        <div className={`overlay-bar ${classNames({ scrolled })}`}>
            <OverlayBarBack backMode={backMode || "menu"} onBack={onBack} />
            <div className="overlay-bar__slot">{children}</div>
            {uiState.selectedExhibitor ? (
                <button className="far fa-share-alt overlay-bar__share" onClick={handleShare}></button>
            ) : null}
            {hideClose ? null : <button className="far fa-times overlay-bar__close" onClick={handleClose} />}
        </div>
    );
};

export default OverlayBar;
