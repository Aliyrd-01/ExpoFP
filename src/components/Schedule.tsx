import React from "react";
import dateFormat from "dateformat";
import "./Schedule.scss";

export interface ScheduleProps {
    events: {
        name: string;
        startsAt: string;
        endsAt?: string;
        link?: string;
    }[];
}

const Schedule: React.FC<ScheduleProps> = ({ events = [] }) => {
    const sortByDate = events.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
    const grouped = sortByDate.reduce((acc, curr) => {
        const date = new Date(curr.startsAt).toISOString().slice(0, 10);
        acc[date] ? acc[date].push(curr) : (acc[date] = [curr]);
        return acc;
    }, {});

    const EventWrapper = ({ children, link }) => {
        return link.length !== 0 ? (
            <a href={link} className="schedule__event" target="_blank" rel="noopener noreferrer">
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
                                events.map((event) => (
                                    <div key={event.startsAt}>
                                        <EventWrapper link={event.link ? event.link : ""}>
                                            <span>
                                                {dateFormat(event.startsAt, "shortTime")}
                                                {event.endsAt ? ` - ${dateFormat(event.endsAt, "shortTime")}` : null}
                                            </span>
                                            <strong>{event.name}</strong>
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
