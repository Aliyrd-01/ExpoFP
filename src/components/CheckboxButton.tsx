import React, { useState } from "react";
import cn from "classnames";

import "./CheckboxButton.scss";

export interface CheckboxButtonProps {
    checked: boolean;
    label?: string;
    className?: string;
    onClick: () => void;
}

const CheckboxButton: React.FC<CheckboxButtonProps> = ({ checked, label, className, onClick }) => {
    const [animateIcon, setAnimateIcon] = useState(false);

    const handleClick = () => {
        setAnimateIcon(true);
        onClick();

        setTimeout(() => {
            setAnimateIcon(false);
        }, 320);
    };

    return (
        <button type="button" className={cn("efp-checkbox-button", className, { checked })} onClick={handleClick}>
            <div className={cn("efp-checkbox-button__inner", { animate: animateIcon })}></div>
            {label && <span className="efp-checkbox-button__label">{label}</span>}
        </button>
    );
};

export default CheckboxButton;
