import React, { useEffect, useState } from "react";
import classNames from "classnames";
import GalleryBadges from "./GalleryBadges/GalleryBadges";
import GalleryItem from "./GalleryItem/GalleryItem";
import GalleryModal from "./GalleryModal/GalleryModal";
import GalleryPreLoader from "./GalleryPreLoader";

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
    const [originalExists, setOriginalExists] = useState(false);
    const [checkedOriginal, setCheckedOriginal] = useState(false);

    const openModal = (initialSlideIndex: number) => {
        setCurrentSlideIndex(initialSlideIndex);
        setIsModalOpen(true);
        if (onOpenGallery) onOpenGallery();
    };

    const closeModal = () => {
        setIsModalOpen(false);
        if (onCloseGallery) onCloseGallery();
    };

    const originalImageFromTumb = (url: string) => {
        let paths = url.split("/");
        const fileName = paths[paths.length - 1];
        if (fileName.indexOf("original-") === -1) {
            paths[paths.length - 1] = "original-" + fileName;
        }

        return paths.join("/");
    };

    const getImageUrl = (url: string, isOriginal: boolean) => {
        return isOriginal ? originalImageFromTumb(url) : url;
    };

    useEffect(() => {
        const checkOriginalExists = async () => {
            if (images.length > 0) {
                const originalUrl = getImageUrl(images[0], true);
                try {
                    await GalleryPreLoader.load(originalUrl);
                    setOriginalExists(true);
                } catch (error) {
                    setOriginalExists(false);
                }
                setCheckedOriginal(true);
            }
        };

        checkOriginalExists();
    }, [images]);

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
                    images={images.map((url) => getImageUrl(url, originalExists))}
                    leading={leading}
                    initialSlideIndex={currentSlideIndex}
                    onClose={closeModal}
                />
            )}
        </React.Fragment>
    );
};

export default Gallery;
