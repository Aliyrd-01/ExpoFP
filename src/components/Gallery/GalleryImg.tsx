import React, { useEffect, useRef } from "react";
import GalleryPreLoader from "./GalleryPreLoader";

type FillMode = "cover" | "contain";

interface GalleryImgProps {
    url: string;
    setHeight?: boolean;
    fillMode?: FillMode;
    containerRef: React.RefObject<HTMLElement>;
}

const GalleryImg: React.FC<GalleryImgProps> = ({ url, setHeight = false, fillMode = "contain", containerRef }) => {
    const imgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        (async () => {
            if (!imgRef.current) return;

            GalleryPreLoader.load(url).then((image) => {
                imgRef.current.style.backgroundImage = `url(${image.src})`;
                imgRef.current.style.backgroundSize = fillMode;
                if (setHeight) {
                    imgRef.current.style.height = (image.height * containerRef.current.clientWidth) / image.width + "px";
                }
            });
        })();
    }, [url]);

    const style = {
        backgroundImage: `url("${url}")`,
        backgroundSize: fillMode,
    };

    return <div ref={imgRef} className="gallery__img" style={style} />;
};

export default GalleryImg;
