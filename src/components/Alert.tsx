import React, { ReactNode } from "react";
import cn from "classnames";
import "./Alert.scss";

type AlertVariant = "info" | "warning" | "error" | "success";
type AlertPosition = "topRight" | "bottomRight";
export interface AlertProps {
    children?: ReactNode;
    position?: AlertPosition;
    variant?: AlertVariant;
    inline?: boolean;
    showIcon?: boolean;
    closable?: boolean;
    title?: string;
    onClose: () => void;
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
                return "icon-close-circle";
            case "success":
                return "icon-checked-circle";
            case "warning":
                return "icon-warning-circle";
            default:
                return "icon-info-circle";
        }
    };

    return (
        <div className={cn("efp-alert", `efp-alert--${variant}`, { isInline: inline, [`efp-alert--${position}`]: position })}>
            {showIcon ? (
                <div className="efp-alert__icon">
                    <i className={cn(alertIcon(), "size-20")}></i>
                </div>
            ) : null}
            <div className="efp-alert__content">
                {title ? <div className="efp-alert__title">{title}</div> : null}
                {children ? children : null}
            </div>
            {closable && <button type="button" className="efp-alert__close" onClick={onClose}></button>}
        </div>
    );
};

export default Alert;
