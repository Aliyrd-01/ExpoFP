import classNames from "classnames";
import dateFormat from "dateformat";
import sanitizeHTML from "../utils/sanitizeHtml";
import React from "react";
import "./Schedule.scss";

export interface EventI {
    id: string | number;
    name: string;
    description?: string;
    startDate: string;
    endDate?: string;
    link?: string;
}
export interface ScheduleProps {
    events: EventI[];
}

function isCurrent(from: Date | string, to: Date | string) {
    const now = new Date();
    return from <= now && now <= to;
}

const Schedule: React.FC<ScheduleProps> = ({ events = [] }) => {
    events = events.filter((event) => new Date(event.endDate).getTime() > new Date().getTime());

    const sortByDate = events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    const grouped = sortByDate.reduce((acc, curr) => {
        const date = new Date(curr.startDate).toISOString().slice(0, 10);
        acc[date] ? acc[date].push(curr) : (acc[date] = [curr]);
        return acc;
    }, {});

    const EventWrapper = ({ children, link, current }) => {
        return link.length !== 0 ? (
            <a href={link} className={classNames("schedule__event", current)} target="_blank" rel="noopener noreferrer">
                {children}
            </a>
        ) : (
            <div className="schedule__event">{children}</div>
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
                                events.map((event: EventI) => (
                                    <div key={event.id}>
                                        <EventWrapper
                                            link={event.link ? event.link : ""}
                                            current={isCurrent(event.startDate, event.endDate)}
                                        >
                                            <span>
                                                {dateFormat(event.startDate, "shortTime")}
                                                {event.endDate ? ` - ${dateFormat(event.endDate, "shortTime")}` : null}
                                            </span>
                                            <strong>{event.name}</strong>
                                            {event.description && (
                                                <div
                                                    className="schedule__event-desc"
                                                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(event.description) }}
                                                ></div>
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
