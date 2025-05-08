import React, { useMemo } from "react";
import classNames from "classnames";
import "./Radio.scss";

export interface RadioProps {
    label: string;
    value: string | number;
    checked?: boolean;
    className?: string;
    onChange?: () => void;
}

const Radio: React.FC<RadioProps> = ({ label, value, checked, className, onChange }) => {
    const id = useMemo(() => `radio-${Math.random().toString(36).slice(2, 9)}`, []);

    return (
        <label
            htmlFor={id}
            className={classNames("radio", className, {
                "radio--checked": checked,
            })}
            role="radio"
            aria-checked={checked}
        >
            <input type="radio" className="radio__input" id={id} value={value} checked={checked} onChange={onChange} />
            <span className="radio__control" aria-hidden="true"></span>
            <span className="radio__label">{label}</span>
        </label>
    );
};

export default Radio;
