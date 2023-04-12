import React from "react";
import "./RebookingRadioGroup.scss";

type Colors = "#98A2B3" | "#32B175" | "#E1463C" | "#FABA27";
export interface RebookingOption {
    name: string;
    value: string;
    label: string;
    iconName?: string;
    color?: Colors;
    disabled?: boolean;
}
export interface RebookingRadioGroupProps {
    options: RebookingOption[];
    checked: string;
    onChange: (event: any) => void;
}

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

const RebookingRadioGroup: React.FC<RebookingRadioGroupProps> = ({ options, checked, onChange }) => {
    const renderGroup = () => {
        return options.map((option: RebookingOption, index) => {
            return (
                <div className="rebooking-radio" key={option.value}>
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
                        <div className="rebooking-radio__icon" style={{ background: option.color }}>
                            <i className={option.iconName}></i>
                        </div>
                    </label>
                </div>
            );
        });
    };

    return (
        <div className="rebooking-radio-group">            
            <div className="rebooking-radio-group__options">{renderGroup()}</div>
        </div>
    );
};

export default RebookingRadioGroup;
