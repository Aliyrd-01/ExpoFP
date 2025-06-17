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
        get allCategories() {
            return groups.flatMap((group) => group.items);
        },
        get isAllSelected() {
            return this.allCategories.every((item) => this.pendingSelectedIds.includes(item.id));
        },
        get isPartiallySelected() {
            const selectedCount = this.allCategories.filter((item) => this.pendingSelectedIds.includes(item.id)).length;
            return selectedCount > 0 && selectedCount < this.allCategories.length;
        },
        get totalCategoriesCount() {
            return this.allCategories.length;
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

    const handleSelectAll = (checked: boolean) => {
        const allItems = s.allCategories;
        store.setPendingItems(checked ? allItems : []);
    };

    const isShowResultsEnabled = () => {
        return store.state.isOpen;
    };

    return (
        <Modal
            open={store.state.isOpen}
            title={title}
            onClickClose={handleCancel}
            showSelectAll={true}
            isAllSelected={s.isAllSelected}
            isPartiallySelected={s.isPartiallySelected}
            onSelectAllChange={handleSelectAll}
            selectAllLabel={`Select all (${s.totalCategoriesCount})`}
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
