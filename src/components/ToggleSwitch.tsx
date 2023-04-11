import React, { useState } from "react";
import "./ToggleSwitch.scss";
import { useResponsiveClass } from "../hooks/useResponsiveClass";
import classNames from "classnames";

export interface ToggleSwitchProps {
    name: string;
    value: boolean;
    label?: string;
    onChange: (value: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ name, value, label, onChange }) => {
    const responsiveClass = useResponsiveClass();
    const [checked, setChecked] = useState(value);

    const onCheckedChange = () => {
        setChecked(!checked);
        onChange(!checked);
    };

    return (
        <div className={classNames("toggleSwitch", responsiveClass)}>
            <input type="checkbox" name={name} id={name} checked={checked} onChange={onCheckedChange} />
            <label htmlFor={name}>{label ? <span>{label}</span> : null}</label>
        </div>
    );
};

export default ToggleSwitch;
