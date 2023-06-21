import React, { useEffect, useRef } from "react";
import GalleryPreLoader from "../GalleryPreLoader";

type FillMode = "cover" | "contain";

interface GalleryImgProps {
    url: string;
    fillMode?: FillMode;
    leading?: boolean;
    setHeight?: boolean;
    isFullscreen?: boolean;
    position?: "center" | "top";
    onImageLoadHeightUpdate?: () => void;
}

const GalleryImg: React.FC<GalleryImgProps> = ({
    url,
    setHeight = false,
    position = "center",
    isFullscreen = false,
    leading = false,
    fillMode = "contain",
    onImageLoadHeightUpdate,
}) => {
    const imgRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!imgRef.current || !containerRef.current || !leading) return;
        loadImage(url);
    }, [url]);

    const loadImage = async (imageUrl: string) => {
        if (!setHeight) return;

        try {
            const loadedImage = await GalleryPreLoader.load(imageUrl);
            containerRef.current.style.height =
                (loadedImage.height * containerRef.current.clientWidth) / loadedImage.width + "px";
            if (onImageLoadHeightUpdate) onImageLoadHeightUpdate();
        } catch (err) {}
    };

    const style = {
        backgroundImage: `url("${url}")`,
        backgroundSize: fillMode,
        backgroundRepeat: "no-repeat",
        transition: leading ? "all 0.5s ease 0s" : "none",
        backgroundPosition: position,
    };

    return (
        <div ref={containerRef} style={{ width: "100%", height: leading && !isFullscreen ? "250px" : "100%" }}>
            <div ref={imgRef} className="gallery__img" style={style} />
        </div>
    );
};

export default GalleryImg;
