import React, { useEffect, useState } from "react";
import cn from "classnames";
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

    useEffect(() => {
        if (arraysEqual(localSelected, selectedIds)) return;
        onChange(localSelected);
    }, [localSelected]);

    const arraysEqual = (a: (string | number)[], b: (string | number)[]) =>
        a.length === b.length && a.every((v) => b.includes(v));

    const shouldShowGroupTitle = (groupName: string) => {
        return !(groups.length === 1 && groupName === "Categories");
    };

    const isSingleGroup = groups.length === 1;

    return (
        <div className="multi-select-groups">
            <div
                className={cn("multi-select-groups__list", {
                    "multi-select-groups__list--single-group": isSingleGroup,
                })}
            >
                {groups.map((group) => (
                    <div key={group.groupName} className="multi-select-groups__group">
                        {shouldShowGroupTitle(group.groupName) && (
                            <div className="multi-select-groups__group-title">{group.groupName}</div>
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
