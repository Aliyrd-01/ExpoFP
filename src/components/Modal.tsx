import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import classNames from "classnames";
import { useRenderTarget } from "../utils/useRenderTarget";
import "./Modal.scss";

type ModalType = "default" | "share";

export interface ModalProps {
    open: boolean;
    className?: string;
    type?: ModalType;
    onClickClose: () => void;
    children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, className, type = "default", onClickClose, children }) => {
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
            if (e.key === "Escape") {
                onClickClose();
            }
        };

        document.addEventListener("keydown", handleEsc);
        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "";
        };
    }, [open, onClickClose]);

    if (!open || !container) return null;

    const modalContent = (
        <div
            className={classNames("modal", `modal--${type}`, { isOpen }, className)}
            role="dialog"
            aria-modal="true"
            ref={modalRef}
            tabIndex={-1}
            onClick={onClickClose}
        >
            <div className="modal__content" onClick={(e) => e.stopPropagation()}>
                <div className="modal__close" onClick={onClickClose}>
                    <i className="icon-close" aria-hidden="true" />
                </div>
                {children}
            </div>
        </div>
    );

    return createPortal(modalContent, container);
};

export default Modal;
