import classNames from "classnames";
import { useLocalStore, useObserver, observer } from "mobx-react-lite";
import React, { useRef, useState, useEffect } from "react";
import data from "../data";
import store, { uiState } from "../store";
import { GaEventActions, sendEventToGa } from "../tools/gtag";
import settings from "../tools/settings";
import { t, getLocale } from "../utils/i18n";
import { useReaction } from "../utils/mobx";
import Button from "./Button";
import EventBadge from "./EventBadge";
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
        get anyButtons() {
            return !!this.event?.link;
        },
        get disableCollapse() {
            return (this.event?.description || "").length < 800;
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

    return useObserver(() => {
        const event = s.event;
        if (!event) return null;

        const bar = (
            <>
                <div className="efp-event__bar">
                    <span onClick={() => store.toggleMapOverlay()}>
                        <div className="efp-event__bar-name">
                            <div className="efp-event__bar-icon">
                                <i className="icon-event-solid"></i>
                            </div>
                            <span dir="auto">
                                {event.name}
                                <EventBadge event={event} />
                            </span>
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

        function getDescription(description: String) {
            if (description === null) return "";

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
                        showBookmark={!uiState.disableBookmarked && !data.hideBookmarks && !uiState.kiosk}
                        showDirections={s.booth && settings.wayfinding}
                        inBookmark={s.event?.bookmarked || false}
                        showShare={true}
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
                    <div className="efp-event-booths">
                        {s.booth && (
                            <a
                                href={`?${s.booth.slug}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    store.toggleMapOverlay();
                                    store.selectBooth(s.booth);
                                }}
                                className="efp-event-booths__booth"
                            >
                                <div className="efp-event-booths__booth-name">{s.booth.name}</div>
                                {s.booth.layer && (
                                    <div className="efp-event-categories__booth-level">
                                        {data.shortLevelName ? s.booth.layer.shortName : s.booth.layer.description}
                                    </div>
                                )}
                            </a>
                        )}
                    </div>

                    <div className="efp-event-datetime">
                        <div className="efp-event-datetime__row">
                            <div className="efp-event-datetime__info">
                                <div className="efp-event-datetime__date">{formatDate(event.startDate)}</div>
                                <div className="efp-event-datetime__time">
                                    {formatTime(event.startDate)} to {event.endDate ? formatTime(event.endDate) : "-"}
                                </div>
                            </div>
                        </div>
                    </div>

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

    event.bookmarked = !event.bookmarked;
    if (uiState.onBookmarkClick) {
        uiState.onBookmarkClick({
            name: event.name,
            bookmarked: event.bookmarked,
            externalId: event.externalId,
        });
    }
    sendEventToGa(GaEventActions.ClickCustomButton, event.name);
}

function handleVisited() {
    const event = uiState.selectedEventItem;
    if (!event) return;

    sendEventToGa(GaEventActions.ClickCustomButton, event.name);
}

const EventWrapper: React.FC = observer(() => {
    if (!uiState.selectedEventItem) return null;
    return <EventComponent />;
});

export default EventWrapper;
