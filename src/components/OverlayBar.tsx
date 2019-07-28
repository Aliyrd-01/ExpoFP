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
            {hideClose ? null : <a className="far fa-times overlay-bar__close" href="/" onClick={handleClose} />}
        </div>
    );
};

// function OverlayBar() {
//     function classes() {
//         return classNames({
//             "overlay-grip": true,
//             arr: store.uiState.overlaySize === "full"
//         });
//     }

//     function handleClick(e: MouseEvent) {
//         e.preventDefault();
//         store.uiState.toggleMapOverlay();
//     }

//     return (
//         <a href="" className={classes()} onClick={handleClick}>
//             <svg viewBox="0 0 1200 200" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
//                 <path d="M100,100 l 500 100 L 1100 100" />
//                 <path d="M100,150 l 500 0 L 1100 150" />
//             </svg>
//         </a>
//     );
// }

export default OverlayBar;
