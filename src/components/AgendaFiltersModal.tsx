import React from "react";
import { observer } from "mobx-react-lite";
import cn from "classnames";
import { t } from "../utils/i18n";
import { Modal, ToggleSwitch } from ".";
import "./AgendaFiltersModal.scss";

export interface AgendaFiltersModalProps {
    store: any;
}

const AgendaFiltersModal: React.FC<AgendaFiltersModalProps> = observer(({ store }) => {
    const pending = store.state.filters;
    const hasActiveFilters =
        pending.date.pending !== "all" || pending.sortOrder.pending !== "desc" || pending.use24hFormat.pending !== false;

    return (
        <Modal
            open={store.state.isOpen}
            title={t("Agenda Filters")}
            badge={store.activeFiltersCount > 0 ? store.activeFiltersCount : undefined}
            maxWidth={400}
            footerLeft={hasActiveFilters ? [{ label: t("Clear All"), onClick: () => store.resetFilters(), variant: "gray" }] : []}
            footerRight={[{ label: t("Apply Filters"), onClick: () => store.applyFilters(), variant: "primary" }]}
            onClickClose={() => store.closeFilter()}
        >
            <div className="efp-agenda-filters-modal">
                <div className="efp-agenda-filters-modal__section">
                    <h3>{t("Date")}</h3>
                    <div className="efp-agenda-filters-modal__buttons">
                        {(["all", "today", "tomorrow"] as const).map((option) => (
                            <button
                                key={option}
                                className={cn("efp-agenda-filters-modal__btn", {
                                    "is-active": pending.date.pending === option,
                                })}
                                onClick={() => store.setPending("date", option)}
                            >
                                {t(option === "all" ? "All Dates" : option.charAt(0).toUpperCase() + option.slice(1))}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="efp-agenda-filters-modal__section">
                    <h3>{t("Sort Order")}</h3>
                    <div className="efp-agenda-filters-modal__buttons">
                        <button
                            className={cn("efp-agenda-filters-modal__btn", {
                                "is-active": pending.sortOrder.pending === "desc",
                            })}
                            onClick={() => store.setPending("sortOrder", "desc")}
                        >
                            {t("Earliest First")}
                        </button>
                        <button
                            className={cn("efp-agenda-filters-modal__btn", {
                                "is-active": pending.sortOrder.pending === "asc",
                            })}
                            onClick={() => store.setPending("sortOrder", "asc")}
                        >
                            {t("Latest First")}
                        </button>
                    </div>
                </div>

                <div className="efp-agenda-filters-modal__section">
                    <h3>{t("Additional Settings")}</h3>
                    <div className="efp-agenda-filters-modal__toggle">
                        <ToggleSwitch
                            name="use24hFormat"
                            label={t("Show time in 24h format")}
                            value={pending.use24hFormat.pending}
                            onChange={(value) => store.setPending("use24hFormat", value)}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
});

export default AgendaFiltersModal;
