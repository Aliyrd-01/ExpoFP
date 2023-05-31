import React, { useState } from "react";
import classNames from "classnames";
import GalleryBadges from "./GalleryBadges/GalleryBadges";
import GalleryItem from "./GalleryItem/GalleryItem";
import GalleryModal from "./GalleryModal/GalleryModal";

import "./Gallery.scss";

export interface GalleryProps {
    images: string[];
    leading?: boolean;
    onImageLoadHeightUpdate?: () => void;
    onOpenGallery?: () => void;
    onCloseGallery?: () => void;
    className?: string;
}

const Gallery: React.FC<GalleryProps> = (props) => {
    const { images, leading = false, onImageLoadHeightUpdate, onOpenGallery, onCloseGallery, className } = props;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

    const openModal = (initialSlideIndex: number) => {
        setCurrentSlideIndex(initialSlideIndex);
        setIsModalOpen(true);
        if (onOpenGallery) onOpenGallery();
    };

    const closeModal = () => {
        setIsModalOpen(false);
        if (onCloseGallery) onCloseGallery();
    };

    return (
        <React.Fragment>
            <div
                className={classNames(
                    "gallery",
                    {
                        "gallery-leading": leading,
                    },
                    className
                )}
            >
                <div className="gallery__wrapper">
                    {leading ? (
                        <GalleryItem
                            url={images[0]}
                            leading={leading}
                            setHeight={true}
                            fillMode="contain"
                            onClick={() => openModal(0)}
                            onImageLoadHeightUpdate={onImageLoadHeightUpdate}
                        />
                    ) : (
                        images.map((url, i) => (
                            <GalleryItem
                                key={url + i}
                                url={url}
                                position="top"
                                fillMode="cover"
                                onClick={() => openModal(i)}
                                onImageLoadHeightUpdate={onImageLoadHeightUpdate}
                            />
                        ))
                    )}
                </div>
                {!leading && <GalleryBadges onFullscreen={() => openModal(0)} count={images.length} />}
            </div>
            {isModalOpen && (
                <GalleryModal
                    className={className}
                    images={images}
                    leading={leading}
                    initialSlideIndex={currentSlideIndex}
                    onClose={closeModal}
                />
            )}
        </React.Fragment>
    );
};

export default Gallery;
