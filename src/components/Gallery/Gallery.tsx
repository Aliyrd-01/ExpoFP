import React, { useEffect, useRef, useState } from "react";
import { Navigation } from "swiper";
import classNames from "classnames";
import type { Swiper as SwiperInstance } from "swiper";
import { Swiper as SwiperComponent, SwiperSlide } from "swiper/react";
import { TransformWrapper, TransformComponent, useTransformEffect, ReactZoomPanPinchRef } from "react-zoom-pan-pinch-sr";
import GalleryImg from "./GalleryImg";
import GalleryBadges from "./GalleryBadges";
import GalleryControls from "./GalleryControls";

import "./Gallery.scss";

export interface GalleryProps {
    images: string[];
    leading?: boolean;
}

const Gallery: React.FC<GalleryProps> = ({ images, leading = false }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [zoomUtils, setZoomUtils] = useState<ReactZoomPanPinchRef[]>([]);

    const rootRef = useRef(null);
    const swiperRef = useRef<SwiperInstance>(null);
    const prevRef = useRef(null);
    const nextRef = useRef(null);

    const openModal = (initialSlideIndex: number) => {
        setCurrentSlideIndex(initialSlideIndex);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setZoomUtils([]);
        swiperRef.current.destroy();
    };

    const renderImages = () => {
        return images.map((url, i) => {
            return (
                <div className="gallery__item" key={url + i} onClick={() => openModal(i)}>
                    <GalleryImg position="top" fillMode="cover" url={url} />
                </div>
            );
        });
    };

    const renderImagesSwiperZoom = () => {
        return images.map((url, i) => {
            return (
                <SwiperSlide key={url + i}>
                    <TransformWrapper
                        initialScale={1}
                        alignmentAnimation={{ sizeX: 0, sizeY: 0 }}
                        onInit={(controls) => {
                            setZoomUtils((state) => [...state, controls]);
                        }}
                    >
                        <TransformImg leading={leading} swiperRef={swiperRef} url={url} />
                    </TransformWrapper>
                </SwiperSlide>
            );
        });
    };

    const mainSliderOptions: any = {
        initialSlide: currentSlideIndex,
        draggable: false,
        modules: [Navigation],
        spaceBetween: 50,
        slidesPerView: 1,
        navigation: {
            prevEl: prevRef.current,
            nextEl: nextRef.current,
        },
        grabCursor: true,
    };

    return (
        <React.Fragment>
            <div
                ref={rootRef}
                className={classNames("gallery", {
                    "gallery-leading": leading,
                })}
            >
                <div className="gallery__wrapper">
                    {leading ? (
                        <div className="gallery__item" onClick={() => openModal(0)}>
                            <GalleryImg leading={leading} setHeight={true} fillMode="contain" url={images[0]} />
                        </div>
                    ) : (
                        renderImages()
                    )}
                </div>
                {!leading && <GalleryBadges count={images.length} />}
            </div>
            {isModalOpen && (
                <div className="gallery-modal">
                    <SwiperComponent
                        onSwiper={(swiper) => (swiperRef.current = swiper)}
                        className="gallery-slider"
                        onSlideChange={(swiper) => {
                            setCurrentSlideIndex(swiper.activeIndex);
                            zoomUtils[swiper.previousIndex]?.resetTransform();
                        }}
                        {...mainSliderOptions}
                    >
                        {zoomUtils.length ? (
                            <GalleryControls
                                onClose={closeModal}
                                zoomIn={zoomUtils[currentSlideIndex].zoomIn}
                                zoomOut={zoomUtils[currentSlideIndex].zoomOut}
                            />
                        ) : null}
                        {images.length > 1 && (
                            <button ref={nextRef} aria-label="˃" className="gallery-slider__btn next">
                                <svg
                                    className="icon"
                                    width="30"
                                    height="30"
                                    viewBox="0 0 30 30"
                                    fill="none"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M11.25 7.5L18.75 15L11.25 22.5"
                                        stroke="#E4E4E4"
                                        strokeWidth="1.875"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        )}
                        {images.length > 1 && (
                            <button ref={prevRef} aria-label="˂" className="gallery-slider__btn prev">
                                <svg
                                    className="icon"
                                    width="30"
                                    height="30"
                                    viewBox="0 0 30 30"
                                    fill="none"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M18.75 22.5L11.25 15L18.75 7.5"
                                        stroke="#E4E4E4"
                                        strokeWidth="1.875"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        )}
                        {renderImagesSwiperZoom()}
                    </SwiperComponent>
                </div>
            )}
        </React.Fragment>
    );
};

interface TransformImgProps {
    swiperRef: React.RefObject<SwiperInstance>;
    url: string;
    leading: boolean;
}

const TransformImg: React.FC<TransformImgProps> = ({ swiperRef, leading, url }) => {
    useTransformEffect(({ state, instance }) => {
        if (!swiperRef.current) return;
        swiperRef.current.allowTouchMove = state.scale === 1;

        if (state.scale === 1 && state.positionX !== 0 && state.positionY !== 0) {
            instance.setCenter();
        }
    });

    return (
        <TransformComponent wrapperClass="gallery-slider__zoom" contentClass="gallery-slider__zoom-content">
            <GalleryImg isFullscreen={true} leading={leading} url={url} />
        </TransformComponent>
    );
};

export default Gallery;
