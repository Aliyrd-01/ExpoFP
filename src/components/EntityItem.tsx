import React from "react";
import cn from "classnames";
import "./EntityItem.scss";

type AdditionalInfo =
    | { type: "location"; locationName: string; hall?: string; level?: string }
    | { type: "event"; text: string }
    | { type: "speaker"; text: string };

type EntityItemType =
    | "booth"
    | "exhibitor"
    | "event"
    | "speaker"
    | "category"
    | "caffee"
    | "restaurant"
    | "lounge"
    | "stage"
    | "other";

export interface EntityItemProps {
    type: EntityItemType;
    title: string;
    subtitle?: string;
    date?: string;
    time?: string;
    itemsCount?: number;
    image?: string;
    additionalInfo?: AdditionalInfo[];
    bookmarked?: boolean;
    featured?: boolean;
}

const getTypeIcon = (type: EntityItemType): string => {
    switch (type) {
        case "booth":
            return "icon-booth-solid";
        case "exhibitor":
            return "icon-exhibitor-solid";
        case "event":
            return "icon-event-solid";
        case "speaker":
            return "icon-speaker-solid";
        case "category":
            return "icon-category-solid";
        case "caffee":
            return "icon-coffee-solid";
        case "restaurant":
            return "icon-restaurant-solid";
        case "lounge":
            return "icon-lounge-solid";
        case "stage":
            return "icon-stage-solid";
        default:
            return "icon-marker-pin-solid";
    }
};

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
    type,
    title,
    subtitle,
    date,
    time,
    itemsCount,
    image,
    additionalInfo = [],
    bookmarked = false,
    featured = false,
}) => {
    return (
        <div
            className={cn("efp-entity-item", `efp-entity-item--type-${type}`, {
                "is-bookmarked": bookmarked && !featured,
                "is-featured": featured,
            })}
            style={{
                [`--item-type-color` as any]: `var(--color-${type})`,
            }}
        >
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
                    <div className="efp-entity-item__title">{title}</div>
                    {type === "booth" && <span className="efp-entity-item__type-label">Booth</span>}
                    {type === "category" && (
                        <span className="efp-entity-item__type-label">
                            Category {itemsCount !== undefined ? `(${itemsCount})` : ""}
                        </span>
                    )}
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
                <div className="efp-entity-item__image-wrapper">
                    <img src={image} alt={title} className="efp-entity-item__image" />
                </div>
            )}
        </div>
    );
};

export default EntityItem;
