export const assignObjects = (...args) => Object.assign({}, ...args);

export const isTouchDevice = (): boolean => {
    try {
        document.createEvent("TouchEvent");
        return true;
    } catch (e) {
        return false;
    }
};
