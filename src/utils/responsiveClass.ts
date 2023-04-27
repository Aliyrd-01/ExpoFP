const breakpoints = {
    xs: 0,
    sm: 480,
    md: 768,
    lg: 998,
    xl: 1100,
};

export function getResponsiveClass(width: number): string {
    const { sm, md, lg, xl } = breakpoints;

    if (width < sm) {
        return "xs";
    } else if (width >= sm && width < md) {
        return "sm";
    } else if (width >= md && width < lg) {
        return "md";
    } else if (width >= lg && width < xl) {
        return "lg";
    } else {
        return "xl";
    }
}
