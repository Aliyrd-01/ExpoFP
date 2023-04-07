import React, { useState } from "react";
import classNames from "classnames";
import GalleryBadges from "./GalleryBadges/GalleryBadges";
import GalleryItem from "./GalleryItem/GalleryItem";
import GalleryModal from "./GalleryModal/GalleryModal";

import "./Gallery.scss";

export interface GalleryProps {
    images: string[];
    leading?: boolean;
}

const Gallery: React.FC<GalleryProps> = ({ images, leading = false }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

    const openModal = (initialSlideIndex: number) => {
        setCurrentSlideIndex(initialSlideIndex);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <React.Fragment>
            <div
                className={classNames("gallery", {
                    "gallery-leading": leading,
                })}
            >
                <div className="gallery__wrapper">
                    {leading ? (
                        <GalleryItem
                            url={images[0]}
                            leading={leading}
                            setHeight={true}
                            fillMode="contain"
                            onClick={() => openModal(0)}
                        />
                    ) : (
                        images.map((url, i) => (
                            <GalleryItem key={url + i} url={url} position="top" fillMode="cover" onClick={() => openModal(i)} />
                        ))
                    )}
                </div>
                {!leading && <GalleryBadges count={images.length} />}
            </div>
            {isModalOpen && (
                <GalleryModal images={images} leading={leading} initialSlideIndex={currentSlideIndex} onClose={closeModal} />
            )}
        </React.Fragment>
    );
};

export default Gallery;
