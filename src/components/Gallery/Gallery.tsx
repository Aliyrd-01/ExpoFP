import React, { useRef, useState } from "react";
import { Navigation, Pagination, Thumbs } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { TransformWrapper, TransformComponent, useTransformEffect } from "react-zoom-pan-pinch-sr";
import "lazysizes";

import "./Gallery.scss";

export interface GalleryProps {
    images: string[];
}

const Gallery: React.FC<GalleryProps> = ({ images }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [utils, setUtils] = useState([]);

    const swiperRef = useRef(null);
    const prevRef = useRef(null);
    const nextRef = useRef(null);
    const paginationRef = useRef(null);

    const getImageUrl = (idx: number, isOriginal: boolean) => {
        return isOriginal ? originalImageFromTumb(images[idx]) : images[idx];
    };

    const originalImageFromTumb = (tumb) => {
        let paths = tumb.split("/");
        const fileName = paths[paths.length - 1];
        if (fileName.indexOf("original-") === -1) {
            paths[paths.length - 1] = "original-" + fileName;
        }

        return paths.join("/");
    };

    const openModal = (initialSlideIndex: number) => {
        setCurrentSlideIndex(initialSlideIndex);
        setIsModalOpen(true);
    };

    const renderImages = () => {
        return images.map((url, i) => {
            return (
                <div className="gallery__item" key={url + i} onClick={() => openModal(i)}>
                    <img className="lazyload" src={getImageUrl(i, false)} alt={url} loading="lazy" />
                </div>
            );
        });
    };

    const renderImagesThumbs = () => {
        return images.map((url, i) => {
            return (
                <SwiperSlide key={url + i}>
                    <img className="lazyload" src={getImageUrl(i, true)} alt={url} loading="lazy" />
                </SwiperSlide>
            );
        });
    };

    const renderImagesSwiperZoom = () => {
        return images.map((url, i) => {
            return (
                <SwiperSlide key={url + i}>
                    <TransformWrapper
                        initialScale={1}
                        minScale={1}
                        maxScale={7}
                        initialPositionX={0}
                        initialPositionY={0}
                        alignmentAnimation={{ sizeX: 0, sizeY: 0 }}
                        onInit={(controls) => {
                            setUtils((state) => [...state, controls]);
                        }}
                    >
                        <TransformImg swiperRef={swiperRef} url={getImageUrl(i, true)} />
                    </TransformWrapper>
                </SwiperSlide>
            );
        });
    };

    const Controls = ({ zoomIn, zoomOut, className = "" }) => (
        <div className={className}>
            <button
                className="gallery-slider__btn close"
                onClick={() => {
                    setIsModalOpen(false);
                    setUtils([]);
                    setThumbsSwiper(null);
                    swiperRef.current.swiper.destroy();
                }}
            >
                <svg className="icon" width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M22.5 7.5L7.5 22.5M7.5 7.5L22.5 22.5"
                        stroke="#E4E4E4"
                        strokeWidth="1.875"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
            <button className="gallery-slider__btn zoom-in" onClick={() => zoomIn()}>
                <svg className="icon" width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M26.25 26.25L20.8125 20.8125M13.75 10V17.5M10 13.75H17.5M23.75 13.75C23.75 19.2728 19.2728 23.75 13.75 23.75C8.22715 23.75 3.75 19.2728 3.75 13.75C3.75 8.22715 8.22715 3.75 13.75 3.75C19.2728 3.75 23.75 8.22715 23.75 13.75Z"
                        stroke="#E4E4E4"
                        strokeWidth="1.875"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
            <button className="gallery-slider__btn zoom-out" onClick={() => zoomOut()}>
                <svg className="icon" width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M26.25 26.25L20.8125 20.8125"
                        stroke="#E4E4E4"
                        strokeWidth="1.875"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M10 13.75H17.5M23.75 13.75C23.75 19.2728 19.2728 23.75 13.75 23.75C8.22715 23.75 3.75 19.2728 3.75 13.75C3.75 8.22715 8.22715 3.75 13.75 3.75C19.2728 3.75 23.75 8.22715 23.75 13.75Z"
                        stroke="#E4E4E4"
                        strokeWidth="1.875"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
        </div>
    );

    const thumbsOptions: any = {
        modules: [Thumbs],
        slidesPerView: "auto",
        watchSlidesProgress: true,
        slideToClickedSlide: true,
        spaceBetween: 5,
    };

    return (
        <React.Fragment>
            <div className="gallery">
                <div className="gallery__wrapper">{renderImages()}</div>
                <div className="gallery__badge gallery__badge-count">
                    <svg
                        className="icon"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M12.5 16.5H4.77614C4.2713 16.5 4.01887 16.5 3.90199 16.4002C3.80056 16.3135 3.74674 16.1836 3.75721 16.0506C3.76927 15.8974 3.94776 15.7189 4.30474 15.3619L11.3905 8.27614C11.7205 7.94613 11.8855 7.78112 12.0758 7.7193C12.2432 7.66492 12.4235 7.66492 12.5908 7.7193C12.7811 7.78112 12.9461 7.94613 13.2761 8.27614L16.5 11.5V12.5M12.5 16.5C13.9001 16.5 14.6002 16.5 15.135 16.2275C15.6054 15.9878 15.9878 15.6054 16.2275 15.135C16.5 14.6002 16.5 13.9001 16.5 12.5M12.5 16.5H5.5C4.09987 16.5 3.3998 16.5 2.86502 16.2275C2.39462 15.9878 2.01217 15.6054 1.77248 15.135C1.5 14.6002 1.5 13.9001 1.5 12.5V5.5C1.5 4.09987 1.5 3.3998 1.77248 2.86502C2.01217 2.39462 2.39462 2.01217 2.86502 1.77248C3.3998 1.5 4.09987 1.5 5.5 1.5H12.5C13.9001 1.5 14.6002 1.5 15.135 1.77248C15.6054 2.01217 15.9878 2.39462 16.2275 2.86502C16.5 3.3998 16.5 4.09987 16.5 5.5V12.5M7.75 6.08333C7.75 7.00381 7.00381 7.75 6.08333 7.75C5.16286 7.75 4.41667 7.00381 4.41667 6.08333C4.41667 5.16286 5.16286 4.41667 6.08333 4.41667C7.00381 4.41667 7.75 5.16286 7.75 6.08333Z"
                            stroke="white"
                            strokeWidth="1.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <span>{images.length} images</span>
                </div>
                <div className="gallery__badge gallery__badge-fullscreen">
                    <svg
                        className="icon"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M5.33333 0.75H5.15C3.60986 0.75 2.83978 0.75 2.25153 1.04973C1.73408 1.31338 1.31338 1.73408 1.04973 2.25153C0.75 2.83978 0.75 3.60986 0.75 5.15V5.33333M5.33333 17.25H5.15C3.60986 17.25 2.83978 17.25 2.25153 16.9503C1.73408 16.6866 1.31338 16.2659 1.04973 15.7485C0.75 15.1602 0.75 14.3901 0.75 12.85V12.6667M17.25 5.33333V5.15C17.25 3.60986 17.25 2.83978 16.9503 2.25153C16.6866 1.73408 16.2659 1.31338 15.7485 1.04973C15.1602 0.75 14.3901 0.75 12.85 0.75H12.6667M17.25 12.6667V12.85C17.25 14.3901 17.25 15.1602 16.9503 15.7485C16.6866 16.2659 16.2659 16.6866 15.7485 16.9503C15.1602 17.25 14.3901 17.25 12.85 17.25H12.6667"
                            stroke="white"
                            strokeWidth="1.375"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </div>
            {isModalOpen && (
                <div className="gallery-modal">
                    <Swiper
                        ref={swiperRef}
                        initialSlide={currentSlideIndex}
                        draggable={false}
                        className="gallery-slider"
                        modules={[Navigation, Pagination, Thumbs]}
                        thumbs={{ swiper: thumbsSwiper }}
                        spaceBetween={50}
                        slidesPerView={1}
                        navigation={{
                            prevEl: prevRef.current,
                            nextEl: nextRef.current,
                        }}
                        grabCursor={true}
                        pagination={{
                            clickable: true,
                            el: paginationRef.current,
                            type: "custom",
                            renderCustom: function (swiper, current, total) {
                                return `${current} of ${total}`;
                            },
                        }}
                        onSlideChange={(swiper) => {
                            setCurrentSlideIndex(swiper.activeIndex);
                            utils[swiper.previousIndex]?.resetTransform();
                        }}
                    >
                        <div ref={paginationRef} className="gallery-slider__pagination" />
                        {utils.length && (
                            <Controls
                                className="gallery-slider__controls"
                                zoomIn={utils[currentSlideIndex].zoomIn}
                                zoomOut={utils[currentSlideIndex].zoomOut}
                            />
                        )}
                        <button ref={nextRef} className="gallery-slider__btn next">
                            <svg
                                className="icon"
                                width="30"
                                height="30"
                                viewBox="0 0 30 30"
                                fill="none"
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
                        <button ref={prevRef} className="gallery-slider__btn prev">
                            <svg
                                className="icon"
                                width="30"
                                height="30"
                                viewBox="0 0 30 30"
                                fill="none"
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
                        {renderImagesSwiperZoom()}
                    </Swiper>
                    <div className="gallery__thumbs-wrapper">
                        <Swiper className="gallery__thumbs" onSwiper={setThumbsSwiper} {...thumbsOptions}>
                            {renderImagesThumbs()}
                        </Swiper>
                    </div>
                </div>
            )}
        </React.Fragment>
    );
};

const TransformImg = ({ swiperRef, url }) => {
    useTransformEffect(({ state, instance }) => {
        if (!swiperRef.current) return;
        swiperRef.current.swiper.allowTouchMove = state.scale === 1;

        if (state.scale === 1 && state.positionX !== 0 && state.positionY !== 0) {
            instance.setCenter();
        }
    });

    return (
        <TransformComponent wrapperClass="gallery-slider__zoom" contentClass="gallery-slider__zoom-content">
            <img className="lazyload" src={url} alt={url} loading="lazy" />
        </TransformComponent>
    );
};

export default Gallery;
