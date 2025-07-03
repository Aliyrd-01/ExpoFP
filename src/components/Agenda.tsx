import React, { useRef, useMemo, useEffect } from "react";
import { useObserver, useLocalStore } from "mobx-react-lite";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import store, { uiState } from "../store";
import { Badge, AgendaFiltersModal, Schedule, OverlayContent } from "./";
import { t } from "../utils/i18n";
import Fuse from "fuse.js";
import "./Agenda.scss";

export interface AgendaProps {
    showFilters?: boolean;
}

const Agenda: React.FC<AgendaProps> = observer(({ showFilters = true }) => {
    const scrollableRef = useRef<HTMLDivElement>();
    const localStore = useLocalStore(() => ({
        searchValue: "",
        setSearchValue: action((value: string) => {
            localStore.searchValue = value;
            store.agendaFilterStore.setSearchText(value);
        }),
    }));

    const events = store.eventStore.eventItems;
    const {
        filters: {
            date: { value: dateFilter },
            sortOrder: { value: sortOrder },
        },
    } = store.agendaFilterStore.state;

    const filteredEvents = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        let filtered = events;

        if (dateFilter !== "all") {
            filtered = filtered.filter((event) => {
                const eventDate = new Date(event.startDate);
                eventDate.setHours(0, 0, 0, 0);

                if (dateFilter === "today") {
                    return eventDate.getTime() === today.getTime();
                }

                if (dateFilter === "tomorrow") {
                    return eventDate.getTime() === tomorrow.getTime();
                }

                return true;
            });
        }

        if (localStore.searchValue) {
            const fuseOptions = {
                keys: ["name"],
                threshold: 0.3,
                ignoreLocation: true,
                includeScore: true,
            };

            const fuse = new Fuse(filtered, fuseOptions);
            const searchResults = fuse.search(localStore.searchValue);
            filtered = searchResults.map((result) => result.item);
        }

        return filtered;
    }, [events, localStore.searchValue, dateFilter, store.agendaFilterStore.state]);

    const sortedEvents = useMemo(() => {
        return [...filteredEvents].sort((a, b) => {
            const dateA = new Date(a.startDate).getTime();
            const dateB = new Date(b.startDate).getTime();
            return sortOrder === "asc" ? dateB - dateA : dateA - dateB;
        });
    }, [filteredEvents, sortOrder]);

    const firstUpcomingEvent = useMemo(() => {
        const now = new Date();
        const upcoming = sortedEvents.find((event) => {
            const endDate = event.endDate ? new Date(event.endDate) : new Date(event.startDate);
            return endDate > now;
        });

        return upcoming;
    }, [sortedEvents]);

    useEffect(() => {
        if (firstUpcomingEvent && scrollableRef.current) {
            const eventElement = scrollableRef.current.querySelector(`[data-event-id="${firstUpcomingEvent.id}"]`);

            if (eventElement) {
                setTimeout(() => {
                    const containerRect = scrollableRef.current.getBoundingClientRect();
                    const elementRect = eventElement.getBoundingClientRect();
                    const scrollTop = elementRect.top - containerRect.top - 60;
                    scrollableRef.current.scrollTop = scrollTop;
                }, 100);
            }
        }
    }, [firstUpcomingEvent, uiState.list.type === "agenda"]);

    const handleEventClick = (event) => {
        store.selectEventItem(event, true);
    };

    const handleCloseBack = () => {
        store.selectSearch();
    };

    const handleFiltersClick = action(() => {
        store.agendaFilterStore.openFilter();
    });

    const handleSearchChange = action((e: React.ChangeEvent<HTMLInputElement>) => {
        localStore.setSearchValue(e.target.value);

        if (scrollableRef.current) {
            scrollableRef.current.scrollTop = 0;
        }
    });

    const bar = (
        <div className="efp-bar">
            <div className="efp-agenda-header">
                <span>{t("Agenda")}</span>
                <Badge variant="lightgray" size="md" rounded>
                    {filteredEvents.length}
                </Badge>
            </div>
        </div>
    );

    return useObserver(() => (
        <OverlayContent
            passScrollableRef={(ref) => {
                scrollableRef.current = ref.current;
            }}
            onClose={handleCloseBack}
            onBack={handleCloseBack}
            backMode="menu"
            bar={bar}
            className="efp-agenda-overlay"
        >
            <div className="efp-agenda-content">
                {showFilters && events.length > 0 && (
                    <div className="efp-agenda-filters">
                        <div className="efp-agenda-filters__search">
                            <input
                                type="text"
                                placeholder={t("Search events")}
                                value={localStore.searchValue}
                                onChange={handleSearchChange}
                            />
                            <i className="icon-search"></i>
                        </div>
                        <button type="button" className="efp-agenda-filters__button" onClick={handleFiltersClick}>
                            <i className="icon-filter-horizontal"></i>
                            {store.agendaFilterStore.activeFiltersCount > 0 && (
                                <span>{store.agendaFilterStore.activeFiltersCount}</span>
                            )}
                        </button>
                    </div>
                )}

                {sortedEvents.length > 0 ? (
                    <Schedule events={sortedEvents} showBooths={true} isAgenda={true} onEventClick={handleEventClick} />
                ) : (
                    <div className="efp-agenda-empty">
                        {store.agendaFilterStore.activeFiltersCount > 0 || localStore.searchValue
                            ? t("No events found. Try adjusting your filters.")
                            : t("No events found")}
                    </div>
                )}

                <AgendaFiltersModal store={store.agendaFilterStore} />
            </div>
        </OverlayContent>
    ));
});

const AgendaWrapper: React.FC<AgendaProps> = observer((props) => {
    if (uiState.list.type !== "agenda" || uiState.details) return null;
    return <Agenda {...props} />;
});

export default AgendaWrapper;
