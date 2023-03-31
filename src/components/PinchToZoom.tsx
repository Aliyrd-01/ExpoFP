import React from "react";
import "./PinchToZoom.scss";

const PinchToZoom = () => {
    return (
        <div className="pinch-to-zoom">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="640"
                height="640"
                fill="none"
                viewBox="0 0 640 640"
                className="pinch-icon"
            >
                <g className="pinch-icon-body">
                    <g className="pinch-hand">
                        <path className="pinch-hand-main" />
                    </g>
                    <g className="pinch-arrows">
                        <path className="pinch-arrow-up" />
                        <path className="pinch-arrow-down" />
                    </g>
                </g>
            </svg>
        </div>
    );
};

export default PinchToZoom;
