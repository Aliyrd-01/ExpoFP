import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import cn from "classnames";
import { t } from "../utils/i18n";
import "./AgendaFilters.scss";

export interface AgendaFiltersProps {
    searchValue: string;
    dateFilter: "all" | "today" | "tomorrow";
    sortOrder: "asc" | "desc";
    onSearchChange: (value: string) => void;
    onDateFilterChange: (value: "all" | "today" | "tomorrow") => void;
    onSortChange: (value: "asc" | "desc") => void;
}

const AgendaFilters: React.FC<AgendaFiltersProps> = observer(
    ({ searchValue, dateFilter, sortOrder, onSearchChange, onDateFilterChange, onSortChange }) => {
        const [isExpanded, setIsExpanded] = useState(false);

        const toggleExpand = () => {
            setIsExpanded(!isExpanded);
        };

        return (
            <div className={cn("efp-agenda-filters", { "is-expanded": isExpanded })}>
                <div className="efp-agenda-filters__header" onClick={toggleExpand}>
                    <span>{t("Filters")}</span>
                    <span className="efp-agenda-filters__arrow">
                        <i className="icon-chevron-right" />
                    </span>
                </div>

                {isExpanded && (
                    <div className="efp-agenda-filters__content">
                        <div className="efp-agenda-filters__search">
                            <input
                                type="text"
                                placeholder={t("Search events")}
                                value={searchValue}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                        </div>

                        <div className="efp-agenda-filters__date">
                            <button
                                className={cn("efp-agenda-filters__btn", { "is-active": dateFilter === "all" })}
                                onClick={() => onDateFilterChange("all")}
                            >
                                {t("All Dates")}
                            </button>
                            <button
                                className={cn("efp-agenda-filters__btn", { "is-active": dateFilter === "today" })}
                                onClick={() => onDateFilterChange("today")}
                            >
                                {t("Today")}
                            </button>
                            <button
                                className={cn("efp-agenda-filters__btn", { "is-active": dateFilter === "tomorrow" })}
                                onClick={() => onDateFilterChange("tomorrow")}
                            >
                                {t("Tomorrow")}
                            </button>
                        </div>

                        <div className="efp-agenda-filters__sort">
                            <button
                                className={cn("efp-agenda-filters__btn", { "is-active": sortOrder === "desc" })}
                                onClick={() => onSortChange("desc")}
                            >
                                {t("Upcoming First")}
                            </button>
                            <button
                                className={cn("efp-agenda-filters__btn", { "is-active": sortOrder === "asc" })}
                                onClick={() => onSortChange("asc")}
                            >
                                {t("Latest First")}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
);

export default AgendaFilters;
