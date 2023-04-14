import React from "react";
import "./RebookingRadioGroup.scss";

export interface RebookingOption {
    name: string;
    value: string;
    label: string;
    iconName?: string;
    type: string;
    disabled?: boolean;
    color: {
        primary: string;
        secondary: string;
    };
}
export interface RebookingRadioGroupProps {
    options: RebookingOption[];
    checked: string;
    showTitle: boolean;
    onChange: (event: any) => void;
}

export const defaultRebookingOptions = [
    {
        name: "offer",
        value: "0",
        label: "Unasked",
        iconName: "icon-question",
        disabled: false,
        color: {
            primary: "#8E99AB",
            secondary: "#EAEFF9",
        },
    },
    {
        name: "offer",
        value: "1",
        label: "Accepted",
        iconName: "icon-checked",
        disabled: false,
        color: {
            primary: "#32B175",
            secondary: "#E4FFF2",
        },
    },
    {
        name: "offer",
        value: "2",
        label: "Rejected",
        iconName: "icon-close",
        disabled: false,
        color: {
            primary: "#E1463C",
            secondary: "#FFEDEB",
        },
    },
    {
        name: "offer",
        value: "3",
        label: "Undecided",
        iconName: "icon-switch-horizontal",
        disabled: false,
        color: {
            primary: "#FABA27",
            secondary: "#FFF7E5",
        },
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
                            "--rebooking-color-primary": `${option.color.primary}`,
                            "--rebooking-color-secondary": `${option.color.secondary}`,
                        } as React.CSSProperties
                    }
                >
                    <input
                        type="radio"
                        name={option.name}
                        value={option.value}
                        id={option.value}
                        checked={option.value === checked}
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
