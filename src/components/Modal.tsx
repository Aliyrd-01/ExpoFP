import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import classNames from "classnames";
import { useRenderTarget } from "../utils/useRenderTarget";
import { Button, ButtonVariant, Badge } from "./";
import "./Modal.scss";

type ModalType = "default" | "share" | "fullscreen";

export interface ModalButton {
    label: string;
    variant?: ButtonVariant;
    disabled?: boolean;
    withBadge?: boolean;
    onClick: () => void;
}

export interface ModalProps {
    open: boolean;
    className?: string;
    type?: ModalType;
    title?: string;
    badge?: number;
    maxWidth?: number;
    children?: React.ReactNode;
    footerLeft?: ModalButton[];
    footerRight?: ModalButton[];
    onClickClose: () => void;
}

const Modal: React.FC<ModalProps> = ({
    open,
    className,
    type = "default",
    title,
    badge,
    maxWidth,
    children,
    footerLeft,
    footerRight,
    onClickClose,
}) => {
    const container = useRenderTarget();
    const modalRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(open);
    const [isVisible, setIsVisible] = useState(open);

    useEffect(() => {
        if (open) {
            setIsVisible(true);
            setTimeout(() => {
                setIsOpen(true);
            }, 10);
            document.body.style.overflow = "hidden";
            setTimeout(() => modalRef.current?.focus(), 0);
        } else {
            setIsOpen(false);
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 200);

            return () => clearTimeout(timer);
        }

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClickClose();
        };

        document.addEventListener("keydown", handleEsc);

        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "";
        };
    }, [open, onClickClose]);

    if (!isVisible || !container) return null;

    const renderButtons = (buttons?: ModalButton[]) =>
        buttons?.map(({ label, onClick, variant = "primary", disabled, withBadge }, idx) => (
            <Button
                key={idx}
                onClick={onClick}
                variant={variant}
                size="md"
                inline={true}
                disabled={disabled}
                withBadge={withBadge}
            >
                {label}
            </Button>
        ));

    return createPortal(
        <div
            className={classNames("modal", `modal--${type}`, { isOpen }, className)}
            role="dialog"
            aria-modal="true"
            ref={modalRef}
            tabIndex={-1}
            onClick={onClickClose}
        >
            <div
                className="modal__box"
                style={maxWidth ? { maxWidth: `${maxWidth}px` } : undefined}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal__header">
                    {title && (
                        <div className="modal__title">
                            {title}
                            {badge !== undefined && badge > 0 && (
                                <Badge variant="lightgray" size="md" noMargins rounded>
                                    {badge}
                                </Badge>
                            )}
                        </div>
                    )}
                    <button type="button" className="modal__close" onClick={onClickClose}>
                        <i className="icon-close" aria-hidden="true" />
                    </button>
                </div>
                <div className="modal__body">{children}</div>
                {(footerLeft?.length || footerRight?.length) && (
                    <div className="modal__footer">
                        {footerLeft?.length > 0 && <div className="modal__footer-left">{renderButtons(footerLeft)}</div>}
                        <div className="modal__footer-right">{renderButtons(footerRight)}</div>
                    </div>
                )}
            </div>
        </div>,
        container
    );
};

export default Modal;
