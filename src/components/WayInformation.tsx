import React from "react";
import classNames from "classnames";
import store from "../store";
import "./WayInformation.scss";

export interface WayInformationItem {
    title: string;
    text: string;
}
export interface WayInformationProps {
    items: WayInformationItem[];
    accessible?: boolean;
}

const WayInformation: React.FC<WayInformationProps> = ({ items, accessible }) =>
    items?.length ? (
        <div className="wayInformation" onClick={() => store.showOverlay()}>
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
