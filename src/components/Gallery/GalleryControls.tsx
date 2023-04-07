import React from "react";

interface GalleryControlsProps {
    zoomIn: () => void;
    zoomOut: () => void;
    onClose: () => void;
}

const GalleryControls: React.FC<GalleryControlsProps> = ({ zoomIn, zoomOut, onClose }) => {
    return (
        <div className="gallery-slider__controls">
            <button className="gallery-slider__btn close" aria-label="🗙" onClick={onClose}>
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
                        d="M22.5 7.5L7.5 22.5M7.5 7.5L22.5 22.5"
                        stroke="#E4E4E4"
                        strokeWidth="1.875"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
            <button className="gallery-slider__btn zoom-in" aria-label="🔺" onClick={() => zoomIn()}>
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
                        d="M26.25 26.25L20.8125 20.8125M13.75 10V17.5M10 13.75H17.5M23.75 13.75C23.75 19.2728 19.2728 23.75 13.75 23.75C8.22715 23.75 3.75 19.2728 3.75 13.75C3.75 8.22715 8.22715 3.75 13.75 3.75C19.2728 3.75 23.75 8.22715 23.75 13.75Z"
                        stroke="#E4E4E4"
                        strokeWidth="1.875"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
            <button className="gallery-slider__btn zoom-out" aria-label="🔻" onClick={() => zoomOut()}>
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
};

export default GalleryControls;
