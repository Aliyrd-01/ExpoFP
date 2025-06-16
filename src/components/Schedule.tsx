import classNames from "classnames";
import dateFormat from "dateformat";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
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
    isAgenda?: boolean;
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

function isLive(event: ScheduleEvent): boolean {
    const now = Date.now();
    const start = Date.parse(event.startDate);
    const end = event.endDate ? Date.parse(event.endDate) : Number.POSITIVE_INFINITY;
    if (isNaN(start) || isNaN(end)) return false;
    return now >= start && now <= end;
}

const Schedule: React.FC<ScheduleProps> = observer(
    ({ events = [], descriptionMaxLength = 200, showMoreButton = true, showBooths = false, isAgenda = false, onEventClick }) => {
        const [eventsFullDescription, setEventsFullDescription] = useState<Record<string, { showFullDescription: boolean }[]>>(
            {}
        );

        const grouped = events.reduce((acc, curr) => {
            const [datePart] = curr.startDate.split("T");
            acc[datePart] ? acc[datePart].push(curr) : (acc[datePart] = [curr]);
            return acc;
        }, {} as Record<string, ScheduleEvent[]>);

        useEffect(() => {
            const initialState: Record<string, { showFullDescription: boolean }[]> = {};
            for (const date in grouped) {
                initialState[date] = grouped[date].map(() => ({ showFullDescription: false }));
            }
            setEventsFullDescription(initialState);
        }, [events.map((e) => e.id).join(",")]);

        const toggleDescription = (e: React.MouseEvent<HTMLButtonElement>, date: string, index: number) => {
            e.preventDefault();
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
                if (event.boothId && onEventClick) {
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
                                                    {isLive(event) && (
                                                        <span className="efp-schedule__event-live-badge">LIVE</span>
                                                    )}
                                                </strong>
                                                {booth && showBooths && (
                                                    <div className="efp-schedule__event-booth">
                                                        <div>{booth.name}</div>
                                                    </div>
                                                )}
                                                {event.description && (
                                                    <div className="efp-schedule__event-desc">
                                                        <div
                                                            dangerouslySetInnerHTML={{
                                                                __html: sanitizeHTML(
                                                                    transformDescription(event.description, showFull)
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
    }
);

export default Schedule;
