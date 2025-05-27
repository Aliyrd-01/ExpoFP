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
    onClick: () => void;
    badge?: number;
}

export interface ModalProps {
    open: boolean;
    className?: string;
    type?: ModalType;
    title?: string;
    badge?: number;
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
    children,
    footerLeft,
    footerRight,
    onClickClose,
}) => {
    const container = useRenderTarget();
    const modalRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(open);

    useEffect(() => {
        setIsOpen(open);
        if (open) {
            document.body.style.overflow = "hidden";
            setTimeout(() => modalRef.current?.focus(), 0);
        } else {
            document.body.style.overflow = "";
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

    if (!open || !container) return null;

    const renderButtons = (buttons?: ModalButton[]) =>
        buttons?.map(({ label, onClick, variant = "primary", disabled, badge }, idx) => (
            <Button key={idx} onClick={onClick} variant={variant} size="md" inline={true} disabled={disabled} badge={badge}>
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
            <div className="modal__box" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    {title && (
                        <div className="modal__title">
                            {title}
                            {badge !== undefined && badge > 0 && (
                                <Badge variant="primary" size="md" noMargins rounded>
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
                        <div className="modal__footer-left">{renderButtons(footerLeft)}</div>
                        <div className="modal__footer-right">{renderButtons(footerRight)}</div>
                    </div>
                )}
            </div>
        </div>,
        container
    );
};

export default Modal;
