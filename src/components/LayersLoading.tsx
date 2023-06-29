import React from "react";
import cn from "classnames";
import "./LayersLoading.scss";

export interface LayersLoadingProps {
    active: boolean;
}

const LayersLoading: React.FC<LayersLoadingProps> = ({ active }) => {
    return (
        <div className={cn("layers-loading", { "is-hidden": !active })}>
            <div className="layers-loading-spinner">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    );
};

export default LayersLoading;
