import cn from "classnames";
import React from "react";
import "./EntityItem.scss";

type AdditionalInfo =
    | { type: "location"; locationName: string; hall?: string; level?: string }
    | { type: "event"; text: string }
    | { type: "speaker"; text: string };

export type EntityItemType =
    | "booth"
    | "exhibitor"
    | "event"
    | "speaker"
    | "category"
    | "cafe"
    | "restaurant"
    | "lounge"
    | "stage"
    | "other";

export interface EntityItemProps {
    id: string;
    type: EntityItemType;
    url: string;
    title: string;
    subtitle?: string;
    date?: string;
    time?: string;
    itemsCount?: number;
    image?: string;
    additionalInfo?: AdditionalInfo[];
    bookmarked?: boolean;
    featured?: boolean;
    onClick?: (type: EntityItemType, id: string) => void;
}

const TYPES_WITH_UNIQUE_COLORS: EntityItemType[] = ["booth", "exhibitor", "event", "speaker", "category"];

const getAdditionalInfoIcon = (type: AdditionalInfo["type"]): string => {
    switch (type) {
        case "location":
            return "icon-marker-pin-solid";
        case "event":
            return "icon-event-solid";
        case "speaker":
            return "icon-speaker-solid";
        default:
            return "";
    }
};

const EntityItem: React.FC<EntityItemProps> = ({
    id,
    type,
    url,
    title,
    subtitle,
    date,
    time,
    itemsCount,
    image,
    additionalInfo = [],
    bookmarked = false,
    featured = false,
    onClick,
}) => {
    const colorType = TYPES_WITH_UNIQUE_COLORS.includes(type) ? type : "other";

    return (
        <div
            onClick={() => onClick(type, id)}
            className={cn("efp-entity-item", {
                "is-featured": featured,
            })}
            style={{ [`--item-type-color` as string]: `var(--color-${colorType})` }}
        >
            <a href={url} className="efp-entity-item__link" aria-label={title}></a>
            <div className="efp-entity-item__body">
                <div className="efp-entity-item__icon">
                    <i className={`icon-${type}-solid`}></i>
                </div>
                {bookmarked && <i className={cn("efp-entity-item__bookmarked", "icon-bookmark-solid")} />}
                <div className="efp-entity-item__content">
                    {type === "event" && (date || time) && (
                        <div className="efp-entity-item__datetime">
                            {date && <strong>{date}</strong>}
                            {time && <span>{time}</span>}
                        </div>
                    )}
                    <div className="efp-entity-item__header">
                        <div className="efp-entity-item__title">
                            {title}
                            {type === "category" && <span>{itemsCount !== undefined && itemsCount}</span>}
                        </div>
                        {type === "booth" && <span className="efp-entity-item__subtitle">Booth</span>}
                        {type === "category" && <span className="efp-entity-item__subtitle">Category</span>}
                        {subtitle && <div className="efp-entity-item__subtitle">{subtitle}</div>}
                    </div>
                    {!!additionalInfo.length && (
                        <ul className="efp-entity-item__details">
                            {additionalInfo.map((info, idx) => (
                                <li key={idx} className="efp-entity-item__details-item">
                                    <i className={cn(getAdditionalInfoIcon(info.type))} />
                                    {info.type === "location" && (
                                        <>
                                            <strong>{info.locationName}</strong>
                                            {info.hall && (
                                                <div>
                                                    Hall <strong>{info.hall}</strong>
                                                </div>
                                            )}
                                            {info.level && (
                                                <div>
                                                    Level <strong>{info.level}</strong>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    {(info.type === "event" || info.type === "speaker") && <strong>{info.text}</strong>}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {image && (
                    <div className="efp-entity-item__image">
                        <img src={image} alt={title} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default EntityItem;
