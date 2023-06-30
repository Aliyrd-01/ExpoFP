import React from "react";
import cn from "classnames";
import "./LayersLoading.scss";

export interface LayersLoadingProps {
    active: boolean;
}

const LayersLoading: React.FC<LayersLoadingProps> = ({ active }) => {
    return (
        <div className={cn("layers-loading", { "is-hidden": !active })}>
            <svg viewBox="25 25 50 50">
                <circle r="20" cy="50" cx="50"></circle>
            </svg>
        </div>
    );
};

export default LayersLoading;
