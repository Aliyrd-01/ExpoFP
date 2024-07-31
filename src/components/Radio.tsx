import React from "react";
import "./Radio.scss";
import classNames from "classnames";

export interface RadioProps {
    label: string;
    value: string | number;
    checked?: boolean;
    onChange?: () => void;
}

export default function Radio({ label, value, checked, onChange }: RadioProps) {
    return (
        <label
            className={classNames({
                radio: true,
                "radio--checked": checked,
            })}
        >
            <input type="radio" className="radio__input" name={label} value={value} checked={checked} onChange={onChange} />
            <span className="radio__control"></span>
            <span className="radio__label">{label}</span>
        </label>
    );
}
