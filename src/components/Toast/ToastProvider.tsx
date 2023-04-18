import React, { useState } from "react";
import { ToastContext } from "./ToastContext";
import { ToastContainer } from "./ToastContainer";

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const handleToastClose = (index) => {
        setToasts((prevToasts) => {
            const updatedToasts = [...prevToasts];
            updatedToasts.splice(index, 1);
            return updatedToasts;
        });
    };

    const toast = {
        open: (message, duration) => {
            setToasts((prevToasts) => [
                ...prevToasts,
                {
                    message,
                    duration,
                },
            ]);
        },
    };

    return (
        <ToastContext.Provider value={toast}>
            <ToastContainer toasts={toasts} handleToastClose={handleToastClose} />
            {children}
        </ToastContext.Provider>
    );
};

export default ToastProvider;
