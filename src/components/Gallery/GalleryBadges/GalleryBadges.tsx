import React from "react";

interface GalleryBadgesProps {
    count: number;
    onFullscreen: () => void;
}

const GalleryBadges: React.FC<GalleryBadgesProps> = ({ count, onFullscreen }) => {
    return (
        <>
            <div className="gallery__badge gallery__badge-count">
                <i className="icon-image"></i>
                <span>{count}</span>
            </div>
            <div className="gallery__badge gallery__badge-fullscreen" onClick={onFullscreen}>
                <i className="icon-maximize"></i>
            </div>
        </>
    );
};

export default GalleryBadges;
