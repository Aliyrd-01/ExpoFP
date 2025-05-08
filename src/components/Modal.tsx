import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import "./Modal.scss";

type modalType = "default" | "share";

export interface ModalProps {
    open: boolean;
    className?: string;
    type?: modalType;
    onClickClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, open, type = "default", onClickClose, className }) => {
    const [isOpen, setIsOpen] = useState(open);
    const modalRef = useRef<HTMLDivElement>(null);

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

    return open ? (
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
                    <i className="icon-close" aria-hidden="true"></i>
                </div>
                {children}
            </div>
        </div>
    ) : null;
};

export default Modal;
