import classNames from "classnames";
import dateFormat from "dateformat";
import React, { useState } from "react";
import sanitizeHTML from "../utils/sanitizeHtml";
import Button from "./Button";
import "./Schedule.scss";

export interface EventI {
    id: string | number;
    name: string;
    description?: string;
    startDate: string;
    endDate?: string;
    link?: string;
    isEnded?: boolean;
}
export interface ScheduleProps {
    events: EventI[];
    descriptionMaxLength?: number;
}

function isCurrent(from: Date | string, to: Date | string) {
    const now = new Date();
    return from <= now && now <= to;
}

const Schedule: React.FC<ScheduleProps> = ({ events = [], descriptionMaxLength = 200 }) => {
    const sortByDate = events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    const grouped = sortByDate.reduce((acc, curr) => {
        const date = new Date(curr.startDate).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });
        acc[date] ? acc[date].push(curr) : (acc[date] = [curr]);
        return acc;
    }, {});

    const [eventsFullDescription, setEventsFullDescription] = useState(
        Object.keys(grouped).reduce((result, date) => {
            result[date] = grouped[date].map((event) => ({
                showFullDescription: false,
            }));
            return result;
        }, {})
    );

    const toggleDescription = (event: React.MouseEvent<HTMLButtonElement>, date: string, index: number) => {
        event.preventDefault();
        setEventsFullDescription((prev) => {
            const newState = { ...prev };
            newState[date][index].showFullDescription = !newState[date][index].showFullDescription;
            return newState;
        });
    };

    const transformDescription = (desc: string, show: boolean) =>
        desc.length > descriptionMaxLength && show === false ? desc.slice(0, descriptionMaxLength) + "..." : desc;

    const EventWrapper = ({ children, link, current, ended }) => {
        return link.length !== 0 ? (
            <a href={link} className={classNames("schedule__event", current, ended)} target="_blank" rel="noopener noreferrer">
                {children}
            </a>
        ) : (
            <div className={classNames("schedule__event", { ended })}>{children}</div>
        );
    };

    return (
        grouped && (
            <div className="schedule">
                {Object.entries(grouped).map(([date, events]) => (
                    <div className="schedule__item" key={date}>
                        <div className="schedule__date">
                            <div>{dateFormat(date, "dd")}</div>
                            <div>{dateFormat(date, "mmm")}</div>
                            <div>{dateFormat(date, "ddd")}</div>
                        </div>
                        <div className="schedule__events">
                            {Array.isArray(events) &&
                                events.map((event: EventI, eventIndex: number) => (
                                    <div key={event.id}>
                                        <EventWrapper
                                            link={event.link ? event.link : ""}
                                            ended={event.isEnded}
                                            current={isCurrent(event.startDate, event.endDate)}
                                        >
                                            <span>
                                                {dateFormat(event.startDate, "shortTime")}
                                                {event.endDate ? ` - ${dateFormat(event.endDate, "shortTime")}` : null}
                                            </span>
                                            <strong>{event.name}</strong>
                                            {event.description && eventsFullDescription[date][eventIndex] && (
                                                <>
                                                    <div
                                                        className="schedule__event-desc"
                                                        dangerouslySetInnerHTML={{
                                                            __html: sanitizeHTML(
                                                                transformDescription(
                                                                    event.description,
                                                                    eventsFullDescription[date][eventIndex].showFullDescription
                                                                )
                                                            ),
                                                        }}
                                                    ></div>
                                                    {event.description.length > descriptionMaxLength && (
                                                        <Button
                                                            variant="gray-border"
                                                            size="sm"
                                                            inline={true}
                                                            onClick={(event) => toggleDescription(event, date, eventIndex)}
                                                        >
                                                            {eventsFullDescription[date][eventIndex].showFullDescription
                                                                ? "Show less"
                                                                : "Show more"}
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                        </EventWrapper>
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        )
    );
};

export default Schedule;
