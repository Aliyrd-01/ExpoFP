import React, { ReactNode } from "react";
import cn from "classnames";
import "./Badge.scss";

export type BadgeVariant = "primary" | "primary-light" | "lightgray" | "gray" | "ghost" | "orange";

export interface BadgeProps {
    children?: ReactNode;
    variant?: BadgeVariant;
    size?: "md" | "lg";
    noMargins?: boolean;
    rounded?: boolean;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = "ghost", size = "lg", noMargins, rounded }) => {
    return (
        <div
            className={cn({
                "efp-badge": true,
                [`efp-badge--${variant}`]: true,
                [`efp-badge--${size}`]: true,
                "is-no-margin": noMargins,
                "is-rounded": rounded,
            })}
        >
            {children}
        </div>
    );
};

export default Badge;
