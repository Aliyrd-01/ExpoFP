import React, { useRef, useMemo } from "react";
import { useObserver, useLocalStore } from "mobx-react-lite";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import store, { uiState } from "../store";
import OverlayContent from "./OverlayContent";
import Schedule from "./Schedule";
import { t } from "../utils/i18n";
import "./Agenda.scss";
import Badge from "./Badge";
import AgendaFiltersModal from "./AgendaFiltersModal";

export interface AgendaProps {
    showFilters?: boolean;
}

const Agenda: React.FC<AgendaProps> = observer(({ showFilters = true }) => {
    const scrollableRef = useRef<HTMLDivElement>();
    const localStore = useLocalStore(() => ({
        searchValue: "",
        setSearchValue: action((value: string) => {
            localStore.searchValue = value;
        }),
    }));

    const events = store.scheduleStore.scheduleItems;
    const { dateFilter, sortOrder } = store.agendaFilterStore.state;

    const filteredEvents = useMemo(() => {
        console.log("Recalculating filtered events with dateFilter:", dateFilter);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        return events.filter((event) => {
            const nameMatch = event.name.toLowerCase().includes(localStore.searchValue.toLowerCase());
            if (!nameMatch) return false;

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
    }, [events, localStore.searchValue, dateFilter, store.agendaFilterStore.state]);

    const sortedEvents = useMemo(() => {
        return [...filteredEvents].sort((a, b) => {
            const dateA = new Date(a.startDate).getTime();
            const dateB = new Date(b.startDate).getTime();
            return sortOrder === "asc" ? dateB - dateA : dateA - dateB;
        });
    }, [filteredEvents, sortOrder]);

    const handleEventClick = (event) => {
        const booth = event.boothId && store.boothStore.booths.find((b) => b.id === event.boothId);
        if (booth) {
            store.selectBooth(booth, true);
        }
    };

    const handleCloseBack = () => {
        store.selectSearch();
    };

    const handleFiltersClick = action(() => {
        store.agendaFilterStore.openFilter();
    });

    const handleSearchChange = action((e: React.ChangeEvent<HTMLInputElement>) => {
        localStore.setSearchValue(e.target.value);
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
                {showFilters && (
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
                    <Schedule events={sortedEvents} showMoreButton={false} showBooths={true} onEventClick={handleEventClick} />
                ) : (
                    <div className="efp-agenda-empty">{t("No events found. Try adjusting your filters.")}</div>
                )}

                <AgendaFiltersModal store={store.agendaFilterStore} />
            </div>
        </OverlayContent>
    ));
});

const AgendaWrapper: React.FC<AgendaProps> = (props) =>
    useObserver(() => uiState.list.type === "agenda" && <Agenda {...props} />);

export default AgendaWrapper;
