import * as React from "react";
import "./Touch.scss";

export default function Touch() {
    return (
        <svg className="touch-container" width="640" height="640" viewBox="0 0 640 640" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    );
}
