import React, { useEffect, useState } from "react";
import cn from "classnames";
import store from "../store";
import "./MultiSelectGroups.scss";
import { uiState } from "../store";

export interface MultiSelectGroupItem {
    id: number | string;
    name: string;
}

export interface MultiSelectGroup {
    groupName: string;
    items: MultiSelectGroupItem[];
}

export interface MultiSelectGroupsProps {
    groups: MultiSelectGroup[];
    selectedIds: (number | string)[];
    onChange: (selectedIds: (number | string)[]) => void;
}

const MultiSelectGroups: React.FC<MultiSelectGroupsProps> = ({ groups = [], selectedIds = [], onChange }) => {
    const [localSelected, setLocalSelected] = useState<(number | string)[]>([]);

    useEffect(() => {
        if (Array.isArray(selectedIds)) {
            setLocalSelected([...selectedIds]);
        }
    }, [selectedIds]);

    const toggle = (id: string | number) => {
        if (!id) return;

        const newSelected = localSelected.includes(id) ? localSelected.filter((i) => i !== id) : [...localSelected, id];

        setLocalSelected(newSelected);
        onChange(newSelected);
    };

    const toggleGroup = (group: MultiSelectGroup) => {
        if (!group?.items?.length) return;

        const groupIds = group.items.map((item) => item.id).filter(Boolean);

        if (!groupIds.length) return;

        const isGroupFullySelected = groupIds.every((id) => localSelected.includes(id));
        const newSelected = isGroupFullySelected
            ? localSelected.filter((id) => !groupIds.includes(id))
            : [...new Set([...localSelected, ...groupIds])];

        setLocalSelected(newSelected);
        onChange(newSelected);
    };

    const isGroupFullySelected = (group: MultiSelectGroup) => {
        if (!group?.items?.length) return false;
        return group.items.every((item) => item.id && localSelected.includes(item.id));
    };

    if (!Array.isArray(groups) || !groups.length) {
        return null;
    }

    return (
        <div className="multi-select-groups">
            <div className="multi-select-groups__list">
                {groups.map((group) => {
                    if (!group?.groupName || !Array.isArray(group.items)) return null;

                    return (
                        <div
                            key={group.groupName}
                            className={cn("multi-select-groups__group", {
                                "multi-select-groups__group--all-categories": group.groupName === "General",
                            })}
                        >
                            {group.groupName !== "General" && (
                                <div className="multi-select-groups__group-header">
                                    <div className="multi-select-groups__group-title">{group.groupName}</div>
                                    <button
                                        className="multi-select-groups__select-all"
                                        onClick={() => toggleGroup(group)}
                                        type="button"
                                    >
                                        {isGroupFullySelected(group) ? "clear selection" : "select all"}
                                    </button>
                                </div>
                            )}
                            <div className="multi-select-groups__group-items">
                                {group.items.map((item) => {
                                    if (!item?.id) return null;

                                    return (
                                        <button
                                            key={item.id}
                                            className={cn("multi-select-groups__item", {
                                                "is-selected": localSelected.includes(item.id),
                                            })}
                                            onClick={() => toggle(item.id)}
                                            type="button"
                                        >
                                            <div>{item.name}</div>
                                            <span className="multi-select-groups__item-count">
                                                {store.categoryStore.categoryById.get(Number(item.id))?.exhibitors?.length || 0}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MultiSelectGroups;
