import React, { useEffect, useState } from "react";
import cn from "classnames";
import store from "../store";
import "./MultiSelectGroups.scss";

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

const MultiSelectGroups: React.FC<MultiSelectGroupsProps> = ({ groups, selectedIds, onChange }) => {
    const [localSelected, setLocalSelected] = useState<(number | string)[]>(selectedIds);

    useEffect(() => {
        setLocalSelected(selectedIds);
    }, [selectedIds]);

    const toggle = (id: number | string) => {
        setLocalSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const toggleGroup = (group: MultiSelectGroup) => {
        const groupIds = group.items.map((item) => item.id);
        const allSelected = groupIds.every((id) => localSelected.includes(id));

        if (allSelected) {
            setLocalSelected((prev) => prev.filter((id) => !groupIds.includes(id)));
        } else {
            setLocalSelected((prev) => {
                const newSelected = [...prev];
                groupIds.forEach((id) => {
                    if (!newSelected.includes(id)) {
                        newSelected.push(id);
                    }
                });
                return newSelected;
            });
        }
    };

    useEffect(() => {
        if (arraysEqual(localSelected, selectedIds)) return;
        onChange(localSelected);
    }, [localSelected]);

    const arraysEqual = (a: (string | number)[], b: (string | number)[]) =>
        a.length === b.length && a.every((v) => b.includes(v));

    const isGroupFullySelected = (group: MultiSelectGroup) => {
        return group.items.every((item) => localSelected.includes(item.id));
    };

    return (
        <div className="multi-select-groups">
            <div className="multi-select-groups__list">
                {groups.map((group) => (
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
                            {group.items.map((item) => (
                                <button
                                    key={item.id}
                                    className={cn("multi-select-groups__item", {
                                        "is-selected": localSelected.includes(item.id),
                                    })}
                                    onClick={() => toggle(item.id)}
                                    type="button"
                                >
                                    {item.name}
                                    <span className="multi-select-groups__item-count">
                                        {store.categoryStore.categoryById.get(Number(item.id))?.exhibitors.length || 0}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MultiSelectGroups;
