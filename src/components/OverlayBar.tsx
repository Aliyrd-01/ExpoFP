import classNames from "classnames";
import React, { MouseEvent } from "react";
import store, { uiState } from "../store";
import "./OverlayBar.scss";
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

    function handleShare() {
        const navigator = window.navigator;
        const data = {
            title: uiState.selectedExhibitor.name,
            url: window.location.href,
        };

        const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Opera Mini/i.test(navigator.userAgent);

        if (mobile && navigator?.canShare(data)) {
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
