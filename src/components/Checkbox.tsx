import React, { useState } from "react";
import "./Checkbox.scss";

export interface CheckboxProps {
    name: string;
    value: boolean;
    label?: string;
    onChange: (value: boolean) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ name, value, label, onChange }) => {
    const [checked, setChecked] = useState(value);

    const onCheckedChange = () => {
        setChecked(!checked);
        onChange(!checked);
    };

    return (
        <div className="checkbox">
            <input type="checkbox" name={name} id={name} checked={checked} onChange={onCheckedChange} />
            <label htmlFor={name}>{label ? label : ""}</label>
        </div>
    );
};

export default Checkbox;
