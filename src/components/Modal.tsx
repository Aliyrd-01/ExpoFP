import React, { useEffect, useState } from "react";
import classNames from "classnames";
import "./Modal.scss";

type modalType = "default" | "share";

export interface ModalProps {
    open: boolean;
    type?: modalType;
    onClickClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, open, type = "default", onClickClose }) => {
    const [isOpen, setIsOpen] = useState(open);

    useEffect(() => {
        setIsOpen(open);
    }, [open]);

    return open ? (
        <div className={classNames("modal", `modal--${type}`, { isOpen: isOpen })} onClick={onClickClose}>
            <div className="modal__content" onClick={(e) => e.stopPropagation()}>
                <div className="far fa-times modal__close" onClick={onClickClose}></div>
                {children}
            </div>
        </div>
    ) : null;
};

export default Modal;
