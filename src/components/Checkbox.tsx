import React, { useState, useEffect, useRef } from "react";
import "./Checkbox.scss";
import classNames from "classnames";

export interface CheckboxProps {
    name: string;
    value: boolean;
    label?: string;
    indeterminate?: boolean;
    size?: "sm" | "md";
    onChange: (value: boolean) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ name, value, label, size = "md", indeterminate = false, onChange }) => {
    const [checked, setChecked] = useState(value);
    const checkboxRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);

    useEffect(() => {
        setChecked(value);
    }, [value]);

    const onCheckedChange = () => {
        setChecked(!checked);
        onChange(!checked);
    };

    return (
        <div
            className={classNames({
                "efp-checkbox": true,
                [`efp-checkbox--${size}`]: true,
            })}
        >
            <input ref={checkboxRef} type="checkbox" name={name} id={name} checked={checked} onChange={onCheckedChange} />
            <label htmlFor={name}>{label ? label : ""}</label>
        </div>
    );
};

export default Checkbox;
