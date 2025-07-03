import React, { useState, useEffect } from "react";
import classNames from "classnames";
import { EventItem } from "../store/EventStore";
import { calculateTimeUntilStart, formatTimeUntilStart, getEventStatus } from "../utils/eventTime";
import "./EventBadge.scss";

export interface EventBadgeProps {
    event: EventItem;
    className?: string;
}

const EventBadge: React.FC<EventBadgeProps> = ({ event, className = "" }) => {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const timeUntil = calculateTimeUntilStart(event.startDate, now);
    const eventStatus = getEventStatus(event, now, timeUntil);

    const getBadgeContent = () => {
        switch (eventStatus) {
            case "live":
                return "LIVE";
            case "upcoming":
                return "UPCOMING";
            case "starting-soon":
                return formatTimeUntilStart(timeUntil);
            case "past":
                return "PAST";
            default:
                return null;
        }
    };

    if (eventStatus === "none") return null;

    return (
        <div
            className={classNames(
                "efp-event-badge",
                `efp-event-badge--${eventStatus}`,
                {
                    "is-urgent": eventStatus === "starting-soon" && timeUntil.isLessThan10Minutes,
                },
                className
            )}
        >
            {getBadgeContent()}
        </div>
    );
};

export default EventBadge;
