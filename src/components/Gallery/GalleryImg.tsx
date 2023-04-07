import React, { useEffect, useRef, useState } from "react";
import GalleryPreLoader from "./GalleryPreLoader";

type FillMode = "cover" | "contain";

interface GalleryImgProps {
    url: string;
    fillMode?: FillMode;
    leading?: boolean;
    setHeight?: boolean;
    isFullscreen?: boolean;
    position?: "center" | "top";
}

const GalleryImg: React.FC<GalleryImgProps> = ({
    url,
    setHeight = false,
    position = "center",
    isFullscreen = "false",
    leading = false,
    fillMode = "contain",
}) => {
    const imgRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!imgRef.current || !containerRef.current) return;

        const originalImage = getImageUrl(url, true);
        const image = getImageUrl(url, false);

        if (leading) {
            loadImage(image);
        } else {
            loadImage(originalImage, image);
        }
    }, [url]);

    const loadImage = async (imageUrl: string, fallbackUrl?: string) => {
        try {
            const loadedImage = await GalleryPreLoader.load(imageUrl);
            setImage(loadedImage);
        } catch (error) {
            if (fallbackUrl) {
                const fallbackImage = await GalleryPreLoader.load(fallbackUrl);
                setImage(fallbackImage);
            }
        }
    };

    const setImage = (image: HTMLImageElement) => {
        if (setHeight) {
            containerRef.current.style.height = (image.height * containerRef.current.clientWidth) / image.width + "px";
        }
        imgRef.current.style.backgroundImage = `url(${image.src})`;
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

    const style = {
        backgroundImage: leading ? `url("${getImageUrl(url, false)}")` : `url("${getImageUrl(url, true)}")`,
        backgroundSize: fillMode,
        transition: leading ? "all 0.5s ease 0s" : "none",
        backgroundColor: "black",
        backgroundPosition: position,
    };

    return (
        <div ref={containerRef} style={{ width: "100%", height: leading && !isFullscreen ? "250px" : "100%" }}>
            <div ref={imgRef} className="gallery__img" style={style} />
        </div>
    );
};

export default GalleryImg;
