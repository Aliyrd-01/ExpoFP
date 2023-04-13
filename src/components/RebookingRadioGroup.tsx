import React from "react";
import "./RebookingRadioGroup.scss";

export interface RebookingOption {
    name: string;
    value: string;
    label: string;
    iconName?: string;
    type: string;
    disabled?: boolean;
}
export interface RebookingRadioGroupProps {
    options: RebookingOption[];
    checked: string;
    showTitle: boolean;
    onChange: (event: any) => void;
}

const colors = {
    unasked: {
        primary: "#98A2B3",
        secondary: "#EAEFF9",
    },
    accepted: {
        primary: "#32B175",
        secondary: "#E4FFF2",
    },
    rejected: {
        primary: "#E1463C",
        secondary: "#FFEDEB",
    },
    undecided: {
        primary: "#FABA27",
        secondary: "#FFF7E5",
    },
};

export const defaultRebookingOptions = [
    {
        name: "offer",
        value: "0",
        label: "Unasked",
        iconName: "icon-question",
        color: "#98A2B3",
        disabled: false,
    },
    {
        name: "offer",
        value: "1",
        label: "Accepted",
        iconName: "icon-checked",
        color: "#32B175",
        disabled: false,
    },
    {
        name: "offer",
        value: "2",
        label: "Rejected",
        iconName: "icon-close",
        color: "#E1463C",
        disabled: false,
    },
    {
        name: "offer",
        value: "3",
        label: "Undecided",
        iconName: "icon-question",
        color: "#FABA27",
        disabled: false,
    },
] as RebookingOption[];

const RebookingRadioGroup: React.FC<RebookingRadioGroupProps> = ({ options, checked, showTitle, onChange }) => {
    const renderGroup = () => {
        return options.map((option: RebookingOption, index) => {
            return (
                <div
                    className="rebooking-radio"
                    key={option.value}
                    style={
                        {
                            "--rebooking-color-primary": `${colors[option.type].primary}`,
                            "--rebooking-color-secondary": `${colors[option.type].secondary}`,
                        } as React.CSSProperties
                    }
                >
                    <input
                        type="radio"
                        name={option.name}
                        value={option.value}
                        id={option.value}
                        defaultChecked={option.value === checked}
                        disabled={option.disabled}
                        onChange={onChange}
                    />
                    <label htmlFor={option.value}>
                        <div className="rebooking-radio__label">{option.label}</div>
                        <div className="rebooking-radio__icon">
                            <i className={option.iconName}></i>
                        </div>
                    </label>
                </div>
            );
        });
    };

    return (
        <div className="rebooking-radio-group">
            {showTitle && <div className="rebooking-radio-group__title">Choose Rebooking offer</div>}
            <div className="rebooking-radio-group__options">{renderGroup()}</div>
        </div>
    );
};

export default RebookingRadioGroup;
