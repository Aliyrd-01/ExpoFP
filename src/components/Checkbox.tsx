import React, { useState } from "react";
import "./Checkbox.scss";

export interface CheckboxProps {
    name: string;
    value: boolean;
    label?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ name, value, label }) => {
    const [checked, setChecked] = useState(value);

    const onChange = () => {
        setChecked(!checked);
    };

    return (
        <div className="checkbox">
            <input type="checkbox" name={name} id={name} checked={checked} onChange={onChange} />
            <label htmlFor={name}>{label ? label : ""}</label>
        </div>
    );
};

export default Checkbox;
