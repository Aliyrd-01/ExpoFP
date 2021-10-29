import React from "react";
import "./Button.scss";

type variantTypes = "primary" | "secondary";

export interface ButtonProps {
    variant?: variantTypes;
    text: string;
    disabled?: boolean;
    onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ text, disabled = false, onClick }) => {
    return (
        <button type="button" className="button-s" disabled={disabled} onClick={onClick}>
            {text}
        </button>
    );
};

export default Button;
