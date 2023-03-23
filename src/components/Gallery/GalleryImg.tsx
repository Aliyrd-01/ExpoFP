import React from "react";

interface GalleryImgProps {
    url: string;
}

const GalleryImg: React.FC<GalleryImgProps> = ({ url }) => {
    const originalImageFromTumb = (url) => {
        let paths = url.split("/");
        const fileName = paths[paths.length - 1];
        if (fileName.indexOf("original-") === -1) {
            paths[paths.length - 1] = "original-" + fileName;
        }

        return paths.join("/");
    };

    const getImageUrl = (url, isOriginal: boolean) => {
        return isOriginal ? originalImageFromTumb(url) : url;
    };

    const originalUrl = getImageUrl(url, true);
    const imageUrl = getImageUrl(url, false);

    return (
        <img
            className="lazyload"
            src={originalUrl}
            alt=""
            loading="lazy"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.src = imageUrl;
            }}
        />
    );
};

export default GalleryImg;
