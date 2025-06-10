import React from "react";
import { observer } from "mobx-react-lite";
import cn from "classnames";
import { t } from "../utils/i18n";
import { Modal } from ".";
import "./AgendaFiltersModal.scss";

export interface AgendaFiltersModalProps {
    store: any;
}

const AgendaFiltersModal: React.FC<AgendaFiltersModalProps> = observer(({ store }) => {
    const hasActiveFilters = store.state.pendingDateFilter !== "all" || store.state.pendingSortOrder !== "desc";

    return (
        <Modal
            open={store.state.isOpen}
            title={t("Filters")}
            badge={store.activeFiltersCount > 0 ? store.activeFiltersCount : undefined}
            maxWidth={400}
            footerLeft={hasActiveFilters ? [{ label: t("Clear All"), onClick: () => store.resetFilter(), variant: "gray" }] : []}
            footerRight={[{ label: t("Apply Filters"), onClick: () => store.applyFilter(), variant: "primary" }]}
            onClickClose={() => store.closeFilter()}
        >
            <div className="efp-agenda-filters-modal">
                <div className="efp-agenda-filters-modal__section">
                    <h3>{t("Date")}</h3>
                    <div className="efp-agenda-filters-modal__buttons">
                        <button
                            className={cn("efp-agenda-filters-modal__btn", {
                                "is-active": store.state.pendingDateFilter === "all",
                            })}
                            onClick={() => store.setDateFilter("all")}
                        >
                            {t("All Dates")}
                        </button>
                        <button
                            className={cn("efp-agenda-filters-modal__btn", {
                                "is-active": store.state.pendingDateFilter === "today",
                            })}
                            onClick={() => store.setDateFilter("today")}
                        >
                            {t("Today")}
                        </button>
                        <button
                            className={cn("efp-agenda-filters-modal__btn", {
                                "is-active": store.state.pendingDateFilter === "tomorrow",
                            })}
                            onClick={() => store.setDateFilter("tomorrow")}
                        >
                            {t("Tomorrow")}
                        </button>
                    </div>
                </div>

                <div className="efp-agenda-filters-modal__section">
                    <h3>{t("Sort Order")}</h3>
                    <div className="efp-agenda-filters-modal__buttons">
                        <button
                            className={cn("efp-agenda-filters-modal__btn", {
                                "is-active": store.state.pendingSortOrder === "desc",
                            })}
                            onClick={() => store.setSortOrder("desc")}
                        >
                            {t("Earliest First")}
                        </button>
                        <button
                            className={cn("efp-agenda-filters-modal__btn", {
                                "is-active": store.state.pendingSortOrder === "asc",
                            })}
                            onClick={() => store.setSortOrder("asc")}
                        >
                            {t("Latest First")}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
});

export default AgendaFiltersModal;
