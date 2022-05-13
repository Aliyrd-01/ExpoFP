import React from "react";
import "./Modal.scss";
import { observer } from "mobx-react-lite";
import store from "../store";

interface ModalProps {
    modalType: "share";
}

const Modal: React.FC<ModalProps> = ({ children, modalType }) => {
    const clickHandler = () => {
        store.toggleModal(modalType);
    };

    return (
        <div className="modal" onClick={clickHandler}>
            <div className="modal__content" onClick={(e) => e.stopPropagation()}>
                <div className="far fa-times modal__close" onClick={clickHandler}></div>
                {children}
            </div>
        </div>
    );
};

export default observer(Modal);
