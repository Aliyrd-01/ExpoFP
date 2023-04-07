import React, { useRef, useState } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { Swiper as SwiperComponent, SwiperSlide } from "swiper/react";
import { TransformWrapper, ReactZoomPanPinchRef } from "react-zoom-pan-pinch-sr";
import GalleryControls from "../GalleryControls/GalleryControls";
import TransformImg from "../TransformImg/TransformImg";

import "./GalleryModal.scss";
import { Navigation } from "swiper";

interface GalleryModalProps {
    images: string[];
    leading: boolean;
    initialSlideIndex: number;
    onClose: () => void;
}

const GalleryModal: React.FC<GalleryModalProps> = ({ images, leading, initialSlideIndex, onClose }) => {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlideIndex);
    const [zoomUtils, setZoomUtils] = useState<ReactZoomPanPinchRef[]>([]);

    const swiperRef = useRef<SwiperInstance>(null);
    const prevRef = useRef(null);
    const nextRef = useRef(null);

    const mainSliderOptions: any = {
        initialSlide: initialSlideIndex,
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
                        onClose={onClose}
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
                {images.map((url, i) => (
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
                ))}
            </SwiperComponent>
        </div>
    );
};

export default GalleryModal;
