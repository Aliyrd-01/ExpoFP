import React, { useState, useEffect } from "react";
import ResponsiveClassContext from "../contexts/ResponsiveClassContext";
import { useResponsiveClass } from "../../hooks/useResponsiveClass";

const WithResizeComponent = ({ children }) => {
    const { responsiveClass, updateResponsiveClass } = useResponsiveClass(window.innerWidth);
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        updateResponsiveClass(width);
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
