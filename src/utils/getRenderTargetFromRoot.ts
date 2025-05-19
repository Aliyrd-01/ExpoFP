export function getRenderTargetFromRoot(rootElement: HTMLElement | null): HTMLElement | null {
    if (typeof window === "undefined") return null;

    if (!rootElement) {
        if (process.env.NODE_ENV === "development") {
            console.warn("[getRenderTargetFromRoot] rootElement is null");
        }
        return null;
    }

    const instance = (rootElement as any)["__expofp"];
    if (!instance || !instance.renderTarget) {
        if (process.env.NODE_ENV === "development") {
            console.warn("[getRenderTargetFromRoot] Missing __expofp.renderTarget");
        }
        return null;
    }

    return instance.renderTarget;
}
