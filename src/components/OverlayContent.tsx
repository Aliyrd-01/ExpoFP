import React, { ReactNode } from "react";
import "./OverlayContent.scss";
import { observer } from "mobx-react-lite";

const OverlayContent: React.FC<{ bar: ReactNode }> = ({ bar, children }) => {
    return (
        <div className="overlay-content" id="overlay-content">
            {bar}
            <div className="overlay-content__scrollable" ref="scrollable">
                {children}
            </div>
        </div>
    );
};

export default observer(OverlayContent);
