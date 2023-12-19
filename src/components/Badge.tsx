import React, { ReactNode } from "react";
import cn from "classnames";
import "./Badge.scss";

export interface BadgeProps {
    children?: ReactNode;
    variant?: "gray" | "ghost";
}

const Badge: React.FC<BadgeProps> = ({ children, variant = "ghost" }) => {
    return (
        <div className="layout sb-layout">
            <div className={cn("efp-badge", `efp-badge--${variant}`)}>{children}</div>
        </div>
    );
};

export default Badge;
