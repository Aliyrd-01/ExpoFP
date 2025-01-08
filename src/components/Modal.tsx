import React, { useEffect, useState } from "react";
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

    useEffect(() => {
        setIsOpen(open);
    }, [open]);

    return open ? (
        <div className={classNames("modal", `modal--${type}`, { isOpen: isOpen }, className)} onClick={onClickClose}>
            <div className="modal__content" onClick={(e) => e.stopPropagation()}>
                <div className="modal__close" onClick={onClickClose}>
                    <i className="icon-close"></i>
                </div>
                {children}
            </div>
        </div>
    ) : null;
};

export default Modal;
