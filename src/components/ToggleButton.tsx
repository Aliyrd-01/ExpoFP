import React from "react";
import cn from "classnames";
import "./ToggleButton.scss";

export interface ToggleButtonProps {
    toggled: boolean;
    label?: string;
    className?: string;
    onClick: () => void;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ toggled, label, className, onClick }) => {
    return (
        <button type="button" className={cn("efp-toggle-button", className, { toggled: toggled })} onClick={onClick}>
            <div className="efp-toggle-switch">
                <div className="efp-toggle-switch__slider" />
            </div>
            {label && <span className="efp-toggle-button__label">{label}</span>}
        </button>
    );
};

export default ToggleButton;
