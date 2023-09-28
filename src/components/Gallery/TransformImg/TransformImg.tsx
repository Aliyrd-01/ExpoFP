import React from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { useTransformEffect, TransformComponent } from "react-zoom-pan-pinch-sr";
import GalleryImg from "../GalleryImg/GalleryImg";

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

export default TransformImg;
