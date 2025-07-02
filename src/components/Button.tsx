import React, { ReactNode } from "react";
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
    withBadge?: boolean;
    onClick?: (event) => void;
}

const processLabel = (label: string) => {
    const parts = label.split(/(#\d+#)/);
    const badgeMatch = label.match(/#(\d+)#/);
    const badgeValue = badgeMatch ? badgeMatch[1] : null;

    return {
        content: parts.map((part, index) => {
            if (part.match(/#\d+#/)) {
                return (
                    <div key={index} className="efp-button-badge">
                        {badgeValue}
                    </div>
                );
            }
            return <span key={index}>{part}</span>;
        }),
        hasBadge: !!badgeValue,
    };
};

const Button: React.FC<ButtonProps> = ({
    children,
    inline = false,
    text,
    link,
    target = "_self",
    disabled = false,
    variant = "primary",
    size = "lg",
    ariaLabel,
    title,
    withBadge = false,
    onClick,
}) => {
    const content = children ?? text;
    const { content: processedContent, hasBadge } =
        withBadge && typeof content === "string" ? processLabel(content) : { content, hasBadge: false };

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
                {processedContent}
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
            {processedContent}
        </button>
    );
};

export default Button;
