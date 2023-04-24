import React, { useEffect, useState } from "react";

const breakpoints = {
    xs: 0,
    sm: 480,
    md: 768,
    lg: 998,
    xl: 1100,
};

export const useResponsiveClass = (width: number) => {
    const [responsiveClass, setResponsiveClass] = useState("");

    useEffect(() => {
        updateResponsiveClass(width);
    }, []);

    const updateResponsiveClass = (width: number) => {
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

    return { responsiveClass, updateResponsiveClass };
};
