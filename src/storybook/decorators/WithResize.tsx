import React, { useState, useEffect } from "react";
import ResponsiveClassContext from "../contexts/ResponsiveClassContext";
import { getResponsiveClass } from "../../utils/responsiveClass";

const WithResizeComponent = ({ children }) => {
    const [responsiveClass, setResponsiveClass] = useState("");
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            console.log(window.innerWidth);
            setWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        setResponsiveClass(getResponsiveClass(width));
    }, [width]);

    return <ResponsiveClassContext.Provider value={responsiveClass}>{children}</ResponsiveClassContext.Provider>;
};

const WithResize = (StoryComponent) => {
    return (props) => {
        return (
            <WithResizeComponent>
                <StoryComponent {...props} />
            </WithResizeComponent>
        );
    };
};

export default WithResize;
