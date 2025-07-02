import React, { useMemo } from "react";
import { observer } from "mobx-react-lite";

import store from "../store";
import { FilterGroup } from "../store/types";
import { t } from "../utils/i18n";

import { BaseFilterModal } from "./";

export const CategoryFilterModal: React.FC = observer(() => {
    const groups = useMemo(() => {
        const cats = store.categoryStore.categories || [];
        const grouped: Record<string, { groupName: string; items: { id: number; name: string }[] }> = {};
        const ungroupedItems: { id: number; name: string }[] = [];

        cats.forEach((cat) => {
            if (!cat || !cat.exhibitors || cat.exhibitors.length === 0) return;

            const parts = (cat.name || "").split("/").map((p) => p.trim());

            if (parts.length > 1) {
                const groupName = parts[0];
                const itemName = parts.slice(1).join(" / ");

                if (!grouped[groupName]) {
                    grouped[groupName] = { groupName, items: [] };
                }

                grouped[groupName].items.push({ id: cat.id, name: itemName });
            } else {
                ungroupedItems.push({ id: cat.id, name: cat.name });
            }
        });

        const result: FilterGroup[] = [];

        if (ungroupedItems.length > 0) {
            result.push({
                groupName: "General",
                items: ungroupedItems,
            });
        }

        Object.values(grouped).forEach((group) => {
            if (group.items && group.items.length > 0) {
                result.push(group);
            }
        });

        return result;
    }, [store.categoryStore.categories]);

    return <BaseFilterModal store={store.categoryFilterStore} rootStore={store} title={t("Categories")} groups={groups} />;
});
