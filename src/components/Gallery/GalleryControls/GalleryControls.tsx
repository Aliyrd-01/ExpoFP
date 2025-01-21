import React from "react";
import { t } from "../../../utils/i18n";

interface GalleryControlsProps {
    zoomIn: () => void;
    zoomOut: () => void;
    onClose: () => void;
}

const GalleryControls: React.FC<GalleryControlsProps> = ({ zoomIn, zoomOut, onClose }) => {
    return (
        <div className="gallery-slider__controls">
            <button className="gallery-slider__btn close" title={t("Close")} aria-label={t("Close")} onClick={onClose}>
                <i className="icon-close" aria-hidden="true"></i>
            </button>
            <button
                className="gallery-slider__btn zoom-in"
                title={t("Zoom In")}
                aria-label={t("Zoom In")}
                onClick={() => zoomIn()}
            >
                <i className="icon-zoom-in" aria-hidden="true"></i>
            </button>
            <button
                className="gallery-slider__btn zoom-out"
                title={t("Zoom Out")}
                aria-label={t("Zoom Out")}
                onClick={() => zoomOut()}
            >
                <i className="icon-zoom-out" aria-hidden="true"></i>
            </button>
        </div>
    );
};

export default GalleryControls;
