import React from "react";
import "./AdminBox.scss";

const AdminBox: React.FC<{ className: string, title?: string }> = ({ className, title, children }) => {
    return (
        <div className={`admin-box ${className}`}>
            <label className="admin-box__title">{title}</label>
            {children}
        </div>
    );
};

export default AdminBox;
