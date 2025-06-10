export function getRenderTargetFromRoot(rootElement: HTMLElement | null): HTMLElement | null {
    if (!rootElement) {
        console.error("[getRenderTargetFromRoot] rootElement is null");
        return null;
    }

    const firstChild = rootElement.firstElementChild as HTMLElement;
    if (firstChild && firstChild.shadowRoot) {
        const layout = firstChild.shadowRoot.querySelector("#efp-layout");
        if (layout) {
            return layout as HTMLElement;
        }
    }

    const layout = rootElement.querySelector?.("#efp-layout");
    if (layout) {
        return layout as HTMLElement;
    }

    console.error("[getRenderTargetFromRoot] rootElement is null");
    return null;
}
