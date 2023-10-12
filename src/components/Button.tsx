import React, { ReactNode } from "react";
import cn from "classnames";
import "./Button.scss";

type targets = "_self" | "_blank" | "_parent";

export interface ButtonProps {
    children?: ReactNode;
    inline?: boolean;
    text?: string;
    link?: string;
    target?: targets;
    disabled?: boolean;
    variant?: "primary" | "secondary" | "gray" | "gray-border";
    size?: "sm" | "md" | "lg";
    onClick?: (event) => void;
}

const Button: React.FC<ButtonProps> = ({
    children,
    inline = false,
    text,
    link,
    target = "_self",
    disabled = false,
    variant = "primary",
    size = "lg",
    onClick,
}) => {
    return link ? (
        <a
            href={link}
            className={cn("efp-button", `efp-button--${variant}`, `efp-button--${size}`, { "efp-button--inline": inline })}
            target={target}
            rel="noopener noreferrer"
            onClick={onClick}
        >
            {children ? children : text}
        </a>
    ) : (
        <button
            type="button"
            className={cn("efp-button", `efp-button--${variant}`, `efp-button--${size}`, { "efp-button--inline": inline })}
            disabled={disabled}
            onClick={onClick}
        >
            {children ? children : text}
        </button>
    );
};

export default Button;
