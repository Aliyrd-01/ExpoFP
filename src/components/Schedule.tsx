import classNames from "classnames";
import dateFormat from "dateformat";
import React, { useEffect, useState } from "react";
import sanitizeHTML from "../utils/sanitizeHtml";
import { t } from "../utils/i18n";
import Button from "./Button";
import "./Schedule.scss";
import store from "../store";

export interface ScheduleEvent {
    id: string | number;
    name: string;
    description?: string;
    startDate: string;
    endDate?: string;
    link?: string;
    isEnded?: boolean;
    boothId?: string | number;
}

export interface ScheduleProps {
    events: ScheduleEvent[];
    descriptionMaxLength?: number;
    showMoreButton?: boolean;
    showBooths?: boolean;
    onEventClick?: (event: ScheduleEvent) => void;
}

function isCurrent(from: Date | string, to: Date | string) {
    const now = new Date();
    return from <= now && now <= to;
}

function isPast(endDate: Date | string) {
    const now = new Date();
    return new Date(endDate) < now;
}

const Schedule: React.FC<ScheduleProps> = ({
    events = [],
    descriptionMaxLength = 200,
    showMoreButton,
    showBooths = false,
    onEventClick,
}) => {
    const [eventsFullDescription, setEventsFullDescription] = useState({});

    const grouped = events.reduce((acc, curr) => {
        const date = new Date(curr.startDate).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });
        acc[date] ? acc[date].push(curr) : (acc[date] = [curr]);
        return acc;
    }, {} as Record<string, ScheduleEvent[]>);

    useEffect(() => {
        setEventsFullDescription(
            Object.keys(grouped).reduce((result, date) => {
                result[date] = grouped[date].map((event) => ({
                    showFullDescription: false,
                }));
                return result;
            }, {})
        );
    }, [events]);

    const toggleDescription = (event: React.MouseEvent<HTMLButtonElement>, date: string, index: number) => {
        event.preventDefault();
        setEventsFullDescription((prev) => {
            const newState = { ...prev };
            if (!Array.isArray(newState[date])) {
                newState[date] = [];
            }
            newState[date][index].showFullDescription = !newState[date][index].showFullDescription;
            return newState;
        });
    };

    const transformDescription = (desc: string, show: boolean) =>
        desc.length > descriptionMaxLength && show === false ? desc.slice(0, descriptionMaxLength) + "..." : desc;

    const EventWrapper = ({ children, link, current, ended, event }) => {
        const handleClick = (e: React.MouseEvent) => {
            if (event.boothId && onEventClick) {
                e.preventDefault();
                onEventClick(event);
            }
        };

        return link ? (
            <a
                href={link}
                className={classNames("schedule__event", current, ended)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClick}
            >
                {children}
            </a>
        ) : (
            <div className={classNames("schedule__event", { ended })} onClick={handleClick}>
                {children}
            </div>
        );
    };

    return (
        grouped && (
            <div className="schedule">
                {Object.entries(grouped).map(([date, events]) => (
                    <div className="schedule__item" key={date}>
                        <div className="schedule__date" aria-label={`Date: ${dateFormat(date, "dddd, mmmm d")}`}>
                            <div>{dateFormat(date, "dd")}</div>
                            <div>{dateFormat(date, "mmm")}</div>
                            <div>{dateFormat(date, "ddd")}</div>
                        </div>
                        <div className="schedule__events" role="list">
                            {Array.isArray(events) &&
                                events.map((event: ScheduleEvent, eventIndex: number) => {
                                    const booth = event.boothId ? store.boothStore.boothById.get(Number(event.boothId)) : null;
                                    return (
                                        <div key={event.id} role="listitem">
                                            <EventWrapper
                                                link={event.link ? event.link : ""}
                                                ended={event.isEnded || isPast(event.endDate || event.startDate)}
                                                current={isCurrent(event.startDate, event.endDate)}
                                                event={event}
                                            >
                                                <span>
                                                    {dateFormat(event.startDate, "shortTime")}
                                                    {event.endDate ? ` - ${dateFormat(event.endDate, "shortTime")}` : null}
                                                </span>
                                                <strong>{event.name}</strong>
                                                {booth && showBooths ? (
                                                    <div className="schedule__event-booth">
                                                        <div>{booth.name}</div>
                                                    </div>
                                                ) : null}
                                                {event.description && eventsFullDescription[date]?.[eventIndex] && (
                                                    <>
                                                        <div
                                                            className="schedule__event-desc"
                                                            dangerouslySetInnerHTML={{
                                                                __html: sanitizeHTML(
                                                                    transformDescription(
                                                                        event.description,
                                                                        eventsFullDescription[date][eventIndex]
                                                                            .showFullDescription
                                                                    )
                                                                ),
                                                            }}
                                                        ></div>
                                                        {event.description.length > descriptionMaxLength && showMoreButton ? (
                                                            <Button
                                                                variant="gray-border"
                                                                size="sm"
                                                                inline={true}
                                                                onClick={(event) => toggleDescription(event, date, eventIndex)}
                                                                aria-expanded={
                                                                    eventsFullDescription[date][eventIndex].showFullDescription
                                                                }
                                                                aria-controls={`event-desc-${date}-${eventIndex}`}
                                                            >
                                                                {eventsFullDescription[date][eventIndex].showFullDescription
                                                                    ? t("Show Less")
                                                                    : t("Show More")}
                                                            </Button>
                                                        ) : null}
                                                    </>
                                                )}
                                            </EventWrapper>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                ))}
            </div>
        )
    );
};

export default Schedule;
