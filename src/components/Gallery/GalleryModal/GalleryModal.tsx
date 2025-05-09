import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Swiper as SwiperInstance } from "swiper";
import { Navigation } from "swiper";
import { Swiper as SwiperComponent, SwiperSlide } from "swiper/react";
import { TransformWrapper, ReactZoomPanPinchRef } from "react-zoom-pan-pinch-sr";
import GalleryControls from "../GalleryControls/GalleryControls";
import TransformImg from "../TransformImg/TransformImg";
import { t } from "../../../utils/i18n";
import { useRenderTarget } from "../../../utils/useRenderTarget";
import "./GalleryModal.scss";
import classNames from "classnames";

interface GalleryModalProps {
    images: string[];
    leading: boolean;
    initialSlideIndex: number;
    onClose: () => void;
    className?: string;
}

const GalleryModal: React.FC<GalleryModalProps> = (props) => {
    const { images, leading, initialSlideIndex, onClose, className } = props;

    const container = useRenderTarget();

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

    const modalContent = (
        <div className={classNames("gallery-modal", className)}>
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
                    <button ref={nextRef} title={t("Next slide")} aria-label="˃" className="gallery-slider__btn next">
                        <i className="icon-chevron-right"></i>
                    </button>
                )}
                {images.length > 1 && (
                    <button ref={prevRef} title={t("Prev slide")} aria-label="˂" className="gallery-slider__btn prev">
                        <i className="icon-chevron-left"></i>
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

    return container ? createPortal(modalContent, container) : null;
};

export default GalleryModal;
