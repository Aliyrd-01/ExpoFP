import React, { ReactNode } from "react";
import cn from "classnames";
import "./Badge.scss";

export type BadgeVariant = "lightgray" | "gray" | "ghost" | "orange";

export interface BadgeProps {
    children?: ReactNode;
    variant?: BadgeVariant;
    size?: "md" | "lg";
    noMargins?: boolean;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = "ghost", size = "lg", noMargins }) => {
    return (
        <div className="layout sb-layout">
            <div
                className={cn({
                    "efp-badge": true,
                    [`efp-badge--${variant}`]: true,
                    [`efp-badge--${size}`]: true,
                    "efp-badge--no-margins": noMargins,
                })}
            >
                {children}
            </div>
        </div>
    );
};

export default Badge;
