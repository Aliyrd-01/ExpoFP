import React, { useRef, useState, useMemo } from "react";
import { useObserver } from "mobx-react-lite";
import store, { uiState } from "../store";
import OverlayContent from "./OverlayContent";
import Schedule from "./Schedule";
import { t } from "../utils/i18n";
import "./Agenda.scss";
import Badge from "./Badge";
import AgendaFilters from "./AgendaFilters";

export interface AgendaProps {
    showFilters?: boolean;
}

const Agenda: React.FC<AgendaProps> = ({ showFilters = true }) => {
    const scrollableRef = useRef<HTMLDivElement>();
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [searchValue, setSearchValue] = useState("");
    const [dateFilter, setDateFilter] = useState<"all" | "today" | "tomorrow">("all");

    const events = store.scheduleStore.scheduleItems;

    const filteredEvents = useMemo(() => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        return events.filter((event) => {
            const nameMatch = event.name.toLowerCase().includes(searchValue.toLowerCase());
            if (!nameMatch) return false;

            const eventDate = new Date(event.startDate);

            if (dateFilter === "today") {
                return eventDate.toDateString() === today.toDateString();
            }

            if (dateFilter === "tomorrow") {
                return eventDate.toDateString() === tomorrow.toDateString();
            }

            return true;
        });
    }, [events, searchValue, dateFilter]);

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

    return (
        <OverlayContent
            passScrollableRef={(ref) => {
                scrollableRef.current = ref.current;
            }}
            onClose={handleCloseBack}
            onBack={handleCloseBack}
            backMode="menu"
            bar={bar}
        >
            <div className="efp-agenda-content">
                {showFilters && (
                    <AgendaFilters
                        searchValue={searchValue}
                        onSearchChange={setSearchValue}
                        dateFilter={dateFilter}
                        onDateFilterChange={setDateFilter}
                        sortOrder={sortOrder}
                        onSortChange={setSortOrder}
                    />
                )}

                {sortedEvents.length > 0 ? (
                    <Schedule events={sortedEvents} onEventClick={handleEventClick} showMoreButton={false} />
                ) : (
                    <div className="efp-agenda-empty">{t("No events found. Try adjusting your filters.")}</div>
                )}
            </div>
        </OverlayContent>
    );
};

const AgendaWrapper: React.FC<AgendaProps> = (props) =>
    useObserver(() => uiState.list.type === "agenda" && <Agenda {...props} />);

export default AgendaWrapper;
