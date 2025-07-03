import React, { ReactNode } from "react";
import cn from "classnames";
import "./Alert.scss";

export type AlertVariant = "info" | "warning" | "error" | "success" | "blank";
export type AlertPosition = "topRight" | "bottomRight";

export interface AlertProps {
    children?: ReactNode;
    position?: AlertPosition;
    variant?: AlertVariant;
    inline?: boolean;
    showIcon?: boolean;
    closable?: boolean;
    title?: string;
    onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({
    children,
    position,
    variant = "info",
    inline = false,
    showIcon = true,
    closable = false,
    title,
    onClose,
}) => {
    const alertIcon = () => {
        switch (variant) {
            case "error":
                return "icon-close-solid";
            case "success":
                return "icon-checkmark-solid";
            case "warning":
                return "icon-warning-solid";
            default:
                return "icon-info-solid";
        }
    };

    return (
        <div
            className={cn("efp-alert", `efp-alert--${variant}`, {
                isInline: inline,
                [`efp-alert--${position}`]: position,
            })}
            role={variant === "error" || variant === "warning" ? "alert" : "status"}
            aria-live={variant === "error" || variant === "warning" ? "assertive" : "polite"}
        >
            {showIcon && (
                <div className="efp-alert__icon">
                    <i className={cn(alertIcon())} aria-hidden="true"></i>
                </div>
            )}
            <div className="efp-alert__content">
                {title && <div className="efp-alert__title">{title}</div>}
                {children}
            </div>
            {closable && (
                <button
                    type="button"
                    className="efp-alert__close"
                    onClick={onClose}
                    aria-label="Close alert"
                    title="Close"
                ></button>
            )}
        </div>
    );
};

export default Alert;
