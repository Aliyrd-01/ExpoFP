import classNames from "classnames";
import { useLocalStore, useObserver, observer } from "mobx-react-lite";
import React, { MouseEvent, useRef, useState, useEffect } from "react";
import data from "../data";
import store, { uiState } from "../store";
import { EventItem } from "../store/EventStore";
import { GaEventActions, sendEventToGa } from "../tools/gtag";
import settings from "../tools/settings";
import { t, getLocale } from "../utils/i18n";
import { useReaction } from "../utils/mobx";
import Button from "./Button";
import ErrorBoundary from "./ErrorBoundary";
import "./Event.scss";
import OverlayContent from "./OverlayContent";
import SibebarActions from "./SidebarActions";
import dateFormat from "dateformat";
import sanitizeHTML from "../utils/sanitizeHtml";

function EventComponent() {
    const el = useRef<HTMLDivElement>(null);
    const s = useLocalStore(() => ({
        collapsed: true,
        updateOverlayContent: null as (() => void) | null,

        get event() {
            return uiState.selectedEventItem;
        },
        get booth() {
            return this.event?.boothId ? store.boothStore.booths.find((b) => b.id === this.event.boothId) : null;
        },
        get exhibitor() {
            return this.event?.exhibitorId ? store.exhibitorStore.exhibitors.find((e) => e.id === this.event.exhibitorId) : null;
        },
        get anyButtons() {
            return !!this.event?.link;
        },
        get disableCollapse() {
            return !this.anyButtons || (uiState.overlayPosition === "left" && (this.event?.description || "").length < 800);
        },
    }));

    const [isContentOverflowing, setIsContentOverflowing] = useState(false);
    const detailsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkHeight = () => {
            if (detailsRef.current) {
                const height = detailsRef.current.offsetHeight;
                setIsContentOverflowing(height > 300);
            }
        };

        checkHeight();
    }, []);

    useReaction(
        () => s.event,
        () => {
            if (el.current && el.current.parentElement) {
                el.current.parentElement.scrollTop = 0;
            }
            s.collapsed = true;
        }
    );

    function handleClick(e: any, action: GaEventActions) {
        itemClick(action);
        if (uiState.kiosk) return e.preventDefault();
    }

    function itemClick(action: GaEventActions) {
        if (s.event) {
            sendEventToGa(action, s.event.name);
        }
    }

    const formatTime = (date: string) => {
        const use24hFormat = store.agendaFilterStore.state.filters.use24hFormat.value;
        const d = new Date(date);
        return dateFormat(d, use24hFormat ? "HH:MM" : "h:MMtt");
    };

    const formatDate = (date: string) => {
        const d = new Date(date);
        return dateFormat(d, "dddd, mmmm d, yyyy");
    };

    const isLive = (event: EventItem): boolean => {
        const now = Date.now();
        const start = Date.parse(event.startDate);
        const end = event.endDate ? Date.parse(event.endDate) : Number.POSITIVE_INFINITY;
        if (isNaN(start) || isNaN(end)) return false;
        return now >= start && now <= end;
    };

    const isPast = (event: EventItem): boolean => {
        const now = new Date();
        const endDate = event.endDate ? new Date(event.endDate) : new Date(event.startDate);
        return endDate < now;
    };

    const isUpcoming = (event: EventItem): boolean => {
        const now = new Date();
        const startDate = new Date(event.startDate);
        return startDate > now;
    };

    const getEventStatus = (event: EventItem) => {
        if (isLive(event)) return "live";
        if (isPast(event)) return "past";
        if (isUpcoming(event)) return "upcoming";
        return "unknown";
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "live":
                return t("Live Now");
            case "past":
                return t("Ended");
            case "upcoming":
                return t("Upcoming");
            default:
                return "";
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case "live":
                return "efp-event__status--live";
            case "past":
                return "efp-event__status--past";
            case "upcoming":
                return "efp-event__status--upcoming";
            default:
                return "";
        }
    };

    return useObserver(() => {
        const event = s.event;
        if (!event) return null;

        const status = getEventStatus(event);
        const statusText = getStatusText(status);
        const statusClass = getStatusClass(status);

        const bar = (
            <>
                <div className="efp-event__bar">
                    <span onClick={() => store.toggleMapOverlay()}>
                        <div className="efp-event__bar-name">
                            <div className="efp-event__bar-icon">
                                <i className="icon-event-solid"></i>
                            </div>
                            <span dir="auto">{event.name}</span>
                        </div>
                    </span>
                </div>
                <div className="efp-event__bar-booth" onClick={() => store.toggleMapOverlay()}>
                    {data.boothTerm}
                </div>
            </>
        );

        const expandDescription = () => {
            s.collapsed = false;
            setTimeout(s.updateOverlayContent);
        };

        function renderButton(title: string, url: string) {
            if (!title || !url || uiState.kiosk || uiState.previewMode) return null;
            return (
                <div className="event-custom-button">
                    <Button
                        link={url}
                        inline={true}
                        onClick={(e) => {
                            e.preventDefault();
                            itemClick(GaEventActions.ClickCustomButton);
                            window.open(url, "_blank", "noopener,noreferrer");
                        }}
                        target="_blank"
                    >
                        {title}
                    </Button>
                </div>
            );
        }

        function getDescription(description: string) {
            if (!description) return null;

            const descriptions = description.split(RegExp("(?=!\\*\\/\\/\\|\\|\\^\\^[a-z]{2}\\^\\^\\/\\/\\|\\|\\*!)"));
            const lang = `!*//||^^${getLocale()}^^//||*!`;

            const result = descriptions.find((p) => p.startsWith(lang));
            if (result != null) {
                return result.substring(18);
            } else if (descriptions[0].startsWith(`!*//||^^`) && descriptions[0].length > 18) {
                return descriptions[0].substring(18);
            }

            return descriptions[0];
        }

        function shareButtonVisible() {
            return (
                !data.hideShareButton &&
                !uiState.kiosk &&
                window.location.host.endsWith(".expofp.com") &&
                settings.EXPO !== "globalaltsmiami2024"
            );
        }

        const cls = classNames({
            "efp-event": true,
            [uiState.responsiveClass]: true,
        });

        return (
            <OverlayContent
                className={cls}
                backMode="none"
                onClose={() => store.selectNone()}
                bar={bar}
                aria-label={t("Details")}
                onUpdateFuncSet={(f) => (s.updateOverlayContent = f)}
            >
                <div className="efp-event__buttons">
                    <SibebarActions
                        showBookmark={false}
                        showDirections={s.booth && settings.wayfinding}
                        inBookmark={false}
                        showShare={false}
                        showVisited={false}
                        visited={false}
                        onClickBookmark={bookmark}
                        onClickShare={handleShare}
                        onClickDirections={() => {
                            if (s.booth) {
                                store.routeStore.clickRoute(null, s.booth);
                            }
                        }}
                        onClickVisited={handleVisited}
                    />
                </div>

                <div
                    className={classNames("efp-event__details", {
                        "details-hidden": uiState.kiosk && isContentOverflowing,
                    })}
                    ref={detailsRef}
                >
                    {/* {statusText && (
                        <div className={classNames("event__status", statusClass)}>
                            <span>{statusText}</span>
                        </div>
                    )}

                    <div className="event__time-info">
                        <div className="event__time">
                            <i className="icon-clock"></i>
                            <span>
                                {formatTime(event.startDate)}
                                {event.endDate && ` - ${formatTime(event.endDate)}`}
                            </span>
                        </div>
                        <div className="event__date">
                            <i className="icon-calendar"></i>
                            <span>{formatDate(event.startDate)}</span>
                        </div>
                    </div> */}

                    {/* {s.booth && (
                        <div className="event__booth-info">
                            <div className="event__booth-item">
                                <div className="event__booth-icon">
                                    <i className="icon-marker-pin-solid"></i>
                                </div>
                                <div className="event__booth-content">
                                    <div className="event__booth-name">{s.booth.name}</div>
                                    {s.booth.layer && (
                                        <div className="event__booth-level">
                                            {data.shortLevelName ? s.booth.layer.shortName : s.booth.layer.description}
                                        </div>
                                    )}
                                </div>
                                <Button variant="gray-border" size="sm" onClick={() => store.selectBooth(s.booth, true)}>
                                    {t("View on Map")}
                                </Button>
                            </div>
                        </div>
                    )} */}

                    {event.description && (
                        <div
                            className={classNames("efp-event-description", {
                                collapsed: s.collapsed && !s.disableCollapse,
                            })}
                        >
                            <span
                                className="event-description__content"
                                dir="auto"
                                dangerouslySetInnerHTML={{
                                    __html: sanitizeHTML(getDescription(event.description)),
                                }}
                                onClick={expandDescription}
                            />
                        </div>
                    )}

                    {event.link && <div className="event-custom-buttons">{renderButton(t("Learn More"), event.link)}</div>}
                </div>
            </OverlayContent>
        );
    });
}

function handleShare() {
    const event = uiState.selectedEventItem;
    if (!event) return;

    sendEventToGa(GaEventActions.ClickCustomButton, event.name);
    store.toggleModal("share");
}

function bookmark() {
    const event = uiState.selectedEventItem;
    if (!event) return;

    sendEventToGa(GaEventActions.ClickCustomButton, event.name);
    // TODO: Implement bookmark functionality for events
}

function handleVisited() {
    const event = uiState.selectedEventItem;
    if (!event) return;

    sendEventToGa(GaEventActions.ClickCustomButton, event.name);
    // TODO: Implement visited functionality for events
}

const EventWrapper: React.FC = observer(() => {
    if (!uiState.selectedEventItem) return null;
    return <EventComponent />;
});

export default EventWrapper;
