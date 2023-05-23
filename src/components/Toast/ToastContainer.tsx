import React, { useState } from "react";
import { useTimeout } from "../../utils/useTimeout";
import "./Toast.scss";

export interface ToastProps {
    message: string;
    duration: number;
    onClose: () => void;
}

const Toast = ({ message, duration, onClose }: ToastProps) => {
    const [visible, setVisible] = useState(true);

    const handleTimeout = () => {
        setVisible(false);
        onClose();
    };

    useTimeout(handleTimeout, duration);

    return (
        <div className={`toast ${visible ? "is-visible" : ""}`} onClick={onClose}>
            {message}
        </div>
    );
};

export const ToastContainer = ({ toasts, handleToastClose }) => {
    return (
        <div className="toast-container">
            {toasts.map((toast, index) => (
                <Toast
                    key={`toast-${index}`}
                    message={toast.message}
                    duration={toast.duration}
                    onClose={() => handleToastClose(index)}
                />
            ))}
        </div>
    );
};
