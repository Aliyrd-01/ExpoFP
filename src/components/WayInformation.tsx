import React from "react";
import classNames from "classnames";
import "./WayInformation.scss";

export interface WayInformationItem {
    title: string;
    text: string;
}
export interface WayInformationProps {
    items: WayInformationItem[];
    accessible?: boolean;
    onClick?: () => void;
}

const WayInformation: React.FC<WayInformationProps> = ({ items, accessible, onClick }) =>
    items?.length ? (
        <div className="wayInformation" onClick={onClick}>
            {items.map((item, index) => {
                return (
                    <div
                        className={classNames("wayInformation__item", {
                            "is-accessible": accessible && index === 0,
                        })}
                        key={index}
                    >
                        <span>{item.title}</span>
                        <strong>{item.text}</strong>
                    </div>
                );
            })}
        </div>
    ) : null;

export default WayInformation;
