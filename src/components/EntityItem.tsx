import cn from "classnames";
import React from "react";
import HighlightText from "./HighlightText";
import "./EntityItem.scss";

export type EntityItemAdditionalInfo =
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
    additionalInfo?: EntityItemAdditionalInfo[];
    bookmarked?: boolean;
    featured?: boolean;
    locationTerm?: string;
    visited?: boolean;
    onClick?: (type: EntityItemType, id: string) => void;
    highlighted?: boolean;
    heatmapColor?: string;
    heatmapClicks?: number;
    rebookingColor?: string;
    kioskMode?: boolean;
    compactDetails?: boolean;
}

const TYPES_WITH_UNIQUE_COLORS: EntityItemType[] = ["booth", "exhibitor", "event", "speaker", "category"];

const getAdditionalInfoIcon = (type: EntityItemAdditionalInfo["type"]): string => {
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
    return /^\d+$/.test(input);
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
    highlighted = false,
    heatmapColor,
    heatmapClicks,
    rebookingColor,
    kioskMode = false,
    compactDetails,
}) => {
    const colorType = TYPES_WITH_UNIQUE_COLORS.includes(type) ? type : "other";

    return (
        <div
            role="button"
            className={cn("efp-entity-item", {
                "is-featured": featured,
                "is-visited": visited,
                "is-highlighted": highlighted,
                "has-heatmap": !!heatmapColor,
            })}
            aria-label={title}
            tabIndex={0}
            aria-pressed={highlighted || undefined}
            onClick={() => onClick && onClick(type, id)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick?.(type, id);
                }
            }}
            style={{
                [`--item-type-color` as string]: `var(--color-${colorType})`,
                ...(heatmapColor && ({ "--heatmap-color": heatmapColor } as React.CSSProperties)),
                ...(rebookingColor ? { borderLeft: `5px solid ${rebookingColor}` } : {}),
            }}
        >
            <div className="efp-entity-item__body">
                <div className="efp-entity-item__left">
                    <div className="efp-entity-item__icon">
                        {icon ? <img src={icon} alt={title} /> : <i className={`icon-${type}-solid`} aria-hidden="true"></i>}
                    </div>
                    {!kioskMode && (
                        <>
                            {visited && (
                                <div className="efp-entity-item__visited">
                                    <i className="icon-checkmark" />
                                </div>
                            )}
                            {bookmarked && <i className={cn("efp-entity-item__bookmarked", "icon-bookmark-solid")} />}
                        </>
                    )}
                </div>
                <div className="efp-entity-item__right">
                    <div className="efp-entity-item__content">
                        <div className="efp-entity-item__header">
                            <div className="efp-entity-item__title">
                                <HighlightText text={title} />
                                {type === "category" && <span>{itemsCount !== undefined && itemsCount}</span>}
                            </div>
                            {featured && <div className="efp-entity-item__featured">Featured</div>}
                        </div>
                        {(type === "event" || type === "category" || subtitle) && (
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
                        )}
                        {!!additionalInfo.length && (
                            <ul
                                className={cn("efp-entity-item__details", {
                                    "compact-details": compactDetails,
                                })}
                            >
                                {additionalInfo.map((info, idx) => (
                                    <li key={idx} className="efp-entity-item__details-item">
                                        {info.type === "location" && (
                                            <>
                                                {type !== "category" && type !== "booth" && (
                                                    <div className="efp-entity-item__details-item-booth">{info.locationName}</div>
                                                )}
                                                {info.hall && (
                                                    <div>
                                                        Hall&nbsp;<span>{info.hall}</span>
                                                    </div>
                                                )}
                                                {info.level && (
                                                    <div>
                                                        {shouldShowPrefix(info.level) && <span>Level&nbsp;</span>}
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
