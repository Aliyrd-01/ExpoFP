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
    icon?: string;
    title: string;
    subtitle?: string;
    date?: string;
    time?: string;
    itemsCount?: number;
    image?: string;
    additionalInfo?: AdditionalInfo[];
    bookmarked?: boolean;
    featured?: boolean;
    locationTerm?: string;
    visited?: boolean;
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

const shouldShowPrefix = (input: string): boolean => {
    if (!input) return false;
    return !/(level|floor)/i.test(input);
};

const EntityItem: React.FC<EntityItemProps> = ({
    id,
    type,
    url,
    title,
    icon,
    subtitle,
    date,
    time,
    itemsCount,
    image,
    additionalInfo = [],
    bookmarked = false,
    featured = false,
    locationTerm = "Booth",
    visited,
    onClick,
}) => {
    const colorType = TYPES_WITH_UNIQUE_COLORS.includes(type) ? type : "other";

    return (
        <div
            onClick={() => onClick && onClick(type, id)}
            className={cn("efp-entity-item", {
                "is-featured": featured,
                "is-visited": visited,
            })}
            style={{ [`--item-type-color` as string]: `var(--color-${colorType})` }}
        >
            <a href={url} className="efp-entity-item__link" aria-label={title}></a>
            <div className="efp-entity-item__body">
                <div className="efp-entity-item__left">
                    <div className="efp-entity-item__icon">
                        {icon ? <img src={icon} alt={title} /> : <i className={`icon-${type}-solid`}></i>}
                    </div>
                    {visited && (
                        <div className="efp-entity-item__visited">
                            <i className="icon-checkmark"></i>
                        </div>
                    )}
                    {bookmarked && <i className={cn("efp-entity-item__bookmarked", "icon-bookmark-solid")} />}
                </div>
                <div className="efp-entity-item__right">
                    <div className="efp-entity-item__content">
                        <div className="efp-entity-item__header">
                            <div className="efp-entity-item__title">
                                {title}
                                {type === "category" && <span>{itemsCount !== undefined && itemsCount}</span>}
                            </div>
                            {featured && <div className="efp-entity-item__featured">Featured</div>}
                        </div>
                        {type === "event" || type === "category" || subtitle ? (
                            <div className="efp-entity-item__subtitle">
                                {type === "event" && (date || time) && (
                                    <div className="efp-entity-item__datetime">
                                        {date && <strong>{date}</strong>}
                                        {time && <span>{time}</span>}
                                    </div>
                                )}
                                {type === "category" && <span>Category</span>}
                                {subtitle && <div>{subtitle}</div>}
                            </div>
                        ) : null}
                        {!!additionalInfo.length && (
                            <ul className="efp-entity-item__details">
                                {additionalInfo.map((info, idx) => (
                                    <li key={idx} className="efp-entity-item__details-item">
                                        {info.type === "location" && (
                                            <>
                                                {type !== "category" && type !== "booth" && (
                                                    <span className="booth-badge">{info.locationName}</span>
                                                )}
                                                {info.hall && (
                                                    <div>
                                                        Hall&nbsp;<span>{info.hall}</span>
                                                    </div>
                                                )}
                                                {info.level && (
                                                    <div>
                                                        {shouldShowPrefix(info.level) && "Level "}
                                                        <span>{info.level}</span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {(info.type === "event" || info.type === "speaker") && <span>{info.text}</span>}
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
        </div>
    );
};

export default EntityItem;
