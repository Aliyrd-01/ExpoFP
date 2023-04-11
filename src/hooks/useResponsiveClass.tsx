import React, { useEffect, useState } from "react";

const breakpoints = {
    xs: 0,
    sm: 480,
    md: 768,
    lg: 998,
    xl: 1100,
};

export const useResponsiveClass = () => {
    const [responsiveClass, setResponsiveClass] = useState("");

    useEffect(() => {
        const updateResponsiveClass = (width) => {
            const { sm, md, lg, xl } = breakpoints;

            if (width < sm) {
                setResponsiveClass("xs");
            } else if (width >= sm && width < md) {
                setResponsiveClass("sm");
            } else if (width >= md && width < lg) {
                setResponsiveClass("md");
            } else if (width >= lg && width < xl) {
                setResponsiveClass("lg");
            } else {
                setResponsiveClass("xl");
            }
        };

        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width } = entry.contentRect;
                updateResponsiveClass(width);
            }
        });

        resizeObserver.observe(window["__efpElement"] || document.body);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    return responsiveClass;
};
