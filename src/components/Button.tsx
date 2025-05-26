import React, { ReactNode, MouseEvent } from "react";
import cn from "classnames";
import "./Button.scss";

export type ButtonVariant = "primary" | "secondary" | "gray" | "gray-border" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonTarget = "_self" | "_blank" | "_parent";

export interface ButtonProps {
    children?: ReactNode;
    inline?: boolean;
    text?: string;
    link?: string;
    target?: ButtonTarget;
    disabled?: boolean;
    variant?: ButtonVariant;
    size?: ButtonSize;
    ariaLabel?: string;
    title?: string;
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
    ariaLabel,
    title,
}) => {
    const content = children ?? text;

    const commonClassNames = cn("efp-button", `efp-button--${variant}`, `efp-button--${size}`, {
        "efp-button--inline": inline,
        "is-disabled": disabled,
    });

    if (link) {
        return (
            <a
                href={disabled ? undefined : link}
                className={commonClassNames}
                target={target}
                rel="noopener noreferrer"
                onClick={disabled ? undefined : onClick}
                aria-label={ariaLabel || undefined}
                title={title || ariaLabel || (typeof content === "string" ? content : undefined)}
                role="button"
                aria-disabled={disabled}
                tabIndex={disabled ? -1 : 0}
            >
                {content}
            </a>
        );
    }

    return (
        <button
            type="button"
            className={commonClassNames}
            disabled={disabled}
            onClick={onClick}
            aria-label={ariaLabel || undefined}
            title={title || ariaLabel || (typeof content === "string" ? content : undefined)}
        >
            {content}
        </button>
    );
};

export default Button;
