export function getRenderTargetFromRoot(rootElement: HTMLElement | null): HTMLElement | null {
    if (!rootElement) {
        console.error("[getRenderTargetFromRoot] rootElement is null");
        return null;
    }

    const instance = rootElement["__expofp"];
    if (!instance) {
        console.error("[getRenderTargetFromRoot] No __expofp instance found on rootElement");
        return null;
    }

    return instance.renderTarget || null;
}
