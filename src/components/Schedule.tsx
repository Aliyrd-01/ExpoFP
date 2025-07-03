import React, { useEffect, useState } from "react";
import classNames from "classnames";
import dateFormat from "dateformat";
import { observer } from "mobx-react-lite";

import store from "../store";
import { EventItem } from "../store/EventStore";
import sanitizeHTML from "../utils/sanitizeHtml";
import { t } from "../utils/i18n";

import { Button, EventBadge } from "./";

import "./Schedule.scss";

export interface ScheduleProps {
    events: EventItem[];
    descriptionMaxLength?: number;
    showMoreButton?: boolean;
    showBooths?: boolean;
    isAgenda?: boolean;
    onEventClick?: (event: EventItem) => void;
}

function isCurrent(from: Date | string, to: Date | string) {
    const now = new Date();
    return from <= now && now <= to;
}

function isPast(endDate: Date | string) {
    const now = new Date();
    return new Date(endDate) < now;
}

const Schedule: React.FC<ScheduleProps> = observer(
    ({ events = [], descriptionMaxLength = 200, showMoreButton = true, showBooths = false, isAgenda = false, onEventClick }) => {
        const [eventsFullDescription, setEventsFullDescription] = useState<Record<string, { showFullDescription: boolean }[]>>(
            {},
        );

        const grouped = events.reduce(
            (acc, curr) => {
                const [datePart] = curr.startDate.split("T");
                acc[datePart] ? acc[datePart].push(curr) : (acc[datePart] = [curr]);
                return acc;
            },
            {} as Record<string, EventItem[]>,
        );

        useEffect(() => {
            const initialState: Record<string, { showFullDescription: boolean }[]> = {};
            for (const date in grouped) {
                initialState[date] = grouped[date].map(() => ({ showFullDescription: false }));
            }
            setEventsFullDescription(initialState);
        }, [events.map((e) => e.id).join(",")]);

        const toggleDescription = (e: React.MouseEvent<HTMLButtonElement>, date: string, index: number) => {
            e.preventDefault();
            e.stopPropagation();
            setEventsFullDescription((prev) => {
                const newState = { ...prev };
                if (!Array.isArray(newState[date])) newState[date] = [];
                if (!newState[date][index]) newState[date][index] = { showFullDescription: false };
                newState[date][index].showFullDescription = !newState[date][index].showFullDescription;
                return newState;
            });
        };

        const transformDescription = (desc: string, show: boolean) =>
            desc.length > descriptionMaxLength && !show ? desc.slice(0, descriptionMaxLength) + "..." : desc;

        const formatTime = (date: string) => {
            const use24hFormat = store.agendaFilterStore.state.filters.use24hFormat.value;
            const d = new Date(date);
            return dateFormat(d, use24hFormat ? "HH:MM" : "h:MMtt");
        };

        const formatDateDisplay = (dateStr: string) => {
            const [year, month, day] = dateStr.split("-");
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            return {
                day: day,
                month: dateFormat(date, "mmm"),
                weekday: dateFormat(date, "ddd"),
                full: dateFormat(date, "dddd, mmmm d"),
            };
        };

        const EventWrapper = ({ children, link, current, ended, event }) => {
            const handleClick = (e: React.MouseEvent) => {
                if (onEventClick) {
                    e.preventDefault();
                    onEventClick(event);
                }
            };
            return link ? (
                <a
                    href={link}
                    className={classNames("efp-schedule__event", current, ended)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleClick}
                >
                    {children}
                </a>
            ) : (
                <div className={classNames("efp-schedule__event", { ended })} onClick={handleClick}>
                    {children}
                </div>
            );
        };

        return (
            <div className={classNames("efp-schedule", { "is-agenda": isAgenda })}>
                {Object.entries(grouped).map(([date, events]) => {
                    const formattedDate = formatDateDisplay(date);
                    return (
                        <div className="efp-schedule__item" key={date}>
                            <div className="efp-schedule__date" aria-label={`Date: ${formattedDate.full}`}>
                                <div className="efp-schedule__date-sticky">
                                    <div>{formattedDate.day}</div>
                                    <div>{formattedDate.month}</div>
                                    <div>{formattedDate.weekday}</div>
                                </div>
                            </div>
                            <div className="efp-schedule__events" role="list">
                                {events.map((event, eventIndex) => {
                                    const booth = event.boothId ? store.boothStore.boothById.get(Number(event.boothId)) : null;

                                    const showFull = eventsFullDescription[date]?.[eventIndex]?.showFullDescription ?? false;

                                    return (
                                        <div key={event.id} role="listitem" data-event-id={event.id}>
                                            <EventWrapper
                                                link={event.link || ""}
                                                ended={event.isEnded || isPast(event.endDate || event.startDate)}
                                                current={isCurrent(event.startDate, event.endDate)}
                                                event={event}
                                            >
                                                <span>
                                                    {formatTime(event.startDate)}
                                                    {event.endDate ? ` - ${formatTime(event.endDate)}` : null}
                                                </span>
                                                <strong>
                                                    {event.name}
                                                    <EventBadge event={event} />
                                                </strong>
                                                {booth && showBooths && (
                                                    <div className="efp-schedule__event-booth">
                                                        <div>{booth.name}</div>
                                                    </div>
                                                )}
                                                {event.description && !isAgenda && (
                                                    <div className="efp-schedule__event-desc">
                                                        <div
                                                            dangerouslySetInnerHTML={{
                                                                __html: sanitizeHTML(
                                                                    transformDescription(event.description, showFull),
                                                                ),
                                                            }}
                                                        />
                                                        {event.description.length > descriptionMaxLength && showMoreButton && (
                                                            <Button
                                                                variant="gray-border"
                                                                size="sm"
                                                                inline
                                                                onClick={(e) => toggleDescription(e, date, eventIndex)}
                                                                aria-expanded={showFull}
                                                                aria-controls={`event-desc-${date}-${eventIndex}`}
                                                            >
                                                                {showFull ? t("Show Less") : t("Show More")}
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </EventWrapper>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    },
);

export default Schedule;
