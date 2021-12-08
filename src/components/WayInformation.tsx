import React from "react";
import store from "../store";
import "./WayInformation.scss";

export interface WayInformationItem {
    title: string;
    text: string;
    accessible?: boolean;
}
export interface WayInformationProps {
    items: WayInformationItem[];
}

const WayInformation: React.FC<WayInformationProps> = ({ items }) =>
    items?.length ? (
        <div className="wayInformation" onClick={() => store.showOverlay()}>
            {items.map((item, index) => {
                return (
                    <div className="wayInformation__item" key={index}>
                        <span>{item.title}</span>
                        <strong>{item.text}</strong>
                    </div>
                );
            })}
        </div>
    ) : null;

export default WayInformation;
