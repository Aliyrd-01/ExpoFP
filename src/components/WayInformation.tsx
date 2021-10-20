import React from "react";
import "./WayInformation.scss";

export interface WayInformationItem {
    title: string;
    text: string;
}
export interface WayInformationProps {
    items: Array<WayInformationItem>;
}

const WayInformation: React.FC<WayInformationProps> = ({ items = [] }) => {
    return items.length ? (
        <>
            <div className="wayInformation">
                {items.map((item, index) => {
                    return (
                        <div className="wayInformation__item" key={index}>
                            <span>{item.title}</span>
                            <strong>{item.text}</strong>
                        </div>
                    );
                })}
            </div>
        </>
    ) : (
        <></>
    );
};

export default WayInformation;
