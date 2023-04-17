import React from "react";
import "./TouchHand.scss";

const PinchToZoom = () => {
    return (
        <div className="touch-hand">
            <svg
                width="640"
                height="640"
                viewBox="0 0 640 640"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="touch-hand-icon"
            >
                <g className="touchon">
                    <g id="touchon-body">
                        <circle className="hand-touch-1" />
                        <circle className="hand-touch-2" />
                        <circle className="hand-touch-3" />
                    </g>
                    <g id="touchon-hand-body">
                        <path className="touchon-hand-fill" />
                        <path className="touchon-hand-stroke" />
                    </g>
                </g>
            </svg>
        </div>
    );
};

export default PinchToZoom;
