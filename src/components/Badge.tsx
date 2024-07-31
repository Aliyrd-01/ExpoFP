import React, { ReactNode } from "react";
import cn from "classnames";
import "./Badge.scss";

export interface BadgeProps {
    children?: ReactNode;
    variant?: "gray" | "ghost";
    noMargins?: boolean;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = "ghost", noMargins }) => {
    return (
        <div className="layout sb-layout">
            <div
                className={cn({
                    "efp-badge": true,
                    [`efp-badge--${variant}`]: true,
                    "efp-badge--no-margins": noMargins,
                })}
            >
                {children}
            </div>
        </div>
    );
};

export default Badge;
