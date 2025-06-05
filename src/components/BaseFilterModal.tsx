import React from "react";
import { observer, useLocalStore } from "mobx-react-lite";
import { FilterStore, FilterGroup } from "../store/types";
import { t } from "../utils/i18n";
import { Modal, MultiSelectGroups } from ".";

interface BaseFilterModalProps {
    store: FilterStore;
    rootStore: any;
    title: string;
    groups: FilterGroup[];
}

export const BaseFilterModal: React.FC<BaseFilterModalProps> = observer(({ store, rootStore, title, groups }) => {
    const s = useLocalStore(() => ({
        get pendingSelectedIds() {
            return store.state.pendingItems.map((item) => item.id);
        },
        get totalItemsCount() {
            if (store.state.pendingItems.length === 0) {
                return store.getFilteredItems().length;
            }

            return rootStore.exhibitorStore.exhibitors.filter((exhibitor) =>
                exhibitor.categories.some((category) =>
                    store.state.pendingItems.some((pendingItem) => pendingItem.id === category.id)
                )
            ).length;
        },
    }));

    const handleChange = (selectedIds: (number | string)[]) => {
        const selectedItems = groups.flatMap((group) => group.items).filter((item) => selectedIds.includes(item.id));
        store.setPendingItems(selectedItems);
    };

    const handleApply = () => {
        store.applyFilter();
    };

    const handleCancel = () => {
        store.closeFilter();
    };

    const handleReset = () => {
        store.resetFilter();
    };

    const isShowResultsEnabled = () => {
        return store.state.isOpen;
    };

    return (
        <Modal
            open={store.state.isOpen}
            title={title}
            badge={s.pendingSelectedIds.length > 0 ? s.pendingSelectedIds.length : undefined}
            onClickClose={handleCancel}
            footerLeft={
                s.pendingSelectedIds.length > 0
                    ? [{ label: t("Clear All Selections"), onClick: handleReset, variant: "gray" }]
                    : []
            }
            footerRight={[
                {
                    label:
                        s.pendingSelectedIds.length > 0
                            ? `Show #${s.totalItemsCount}# Matching Exhibitors`
                            : t("Show All Exhibitors"),
                    onClick: handleApply,
                    variant: "primary",
                    withBadge: true,
                    disabled: !isShowResultsEnabled(),
                },
            ]}
        >
            <MultiSelectGroups groups={groups} selectedIds={s.pendingSelectedIds} onChange={handleChange} />
        </Modal>
    );
});
