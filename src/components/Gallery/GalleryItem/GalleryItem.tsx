import React from "react";
import GalleryImg from "../GalleryImg/GalleryImg";

interface GalleryItemProps {
    url: string;
    leading?: boolean;
    setHeight?: boolean;
    fillMode?: "cover" | "contain";
    position?: "center" | "top";
    onClick: () => void;
    onImageLoadHeightUpdate?: () => void;
}

const GalleryItem: React.FC<GalleryItemProps> = ({
    url,
    position = "center",
    leading = false,
    setHeight = false,
    fillMode,
    onClick,
    onImageLoadHeightUpdate,
}) => {
    return (
        <div className="gallery__item" onClick={onClick}>
            <GalleryImg
                position={position}
                fillMode={fillMode}
                url={url}
                leading={leading}
                setHeight={setHeight}
                onImageLoadHeightUpdate={onImageLoadHeightUpdate}
            />
        </div>
    );
};

export default GalleryItem;
