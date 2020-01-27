import React from "react";
import "./AdminBox.scss";

const AdminBox: React.FC<{ className: string }> = ({ className, children }) => {
    return (
        <div className={`admin-box ${className}`}>
            <label className="admin-box__title">Rebooking</label>
            {children}
        </div>
    );
};

export default AdminBox;
