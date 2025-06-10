import { useEffect, useState } from "react";
import { uiState } from "../store";

const findLayoutInShadowRoot = (root: HTMLElement | null): HTMLElement | null => {
    if (!root) return null;
    const firstChild = root.firstElementChild as HTMLElement;
    if (firstChild && firstChild.shadowRoot) {
        return firstChild.shadowRoot.querySelector("#efp-layout") as HTMLElement;
    }
    return null;
};

export const useRenderTarget = (): HTMLElement | null => {
    const [target, setTarget] = useState<HTMLElement | null>(() => findLayoutInShadowRoot(uiState.rootElement));

    useEffect(() => {
        if (typeof window === "undefined" || !uiState.rootElement) return;

        let cancelled = false;
        let observer: MutationObserver | null = null;

        const updateTarget = () => {
            const layout = findLayoutInShadowRoot(uiState.rootElement);
            if (layout && !cancelled) {
                setTarget(prev => (prev !== layout ? layout : prev));
                return true;
            }
            return false;
        };

        if (updateTarget()) return;

        const firstChild = uiState.rootElement.firstElementChild as HTMLElement;
        if (firstChild && firstChild.shadowRoot) {
            observer = new MutationObserver(() => {
                if (updateTarget() && observer) {
                    observer.disconnect();
                }
            });
            observer.observe(firstChild.shadowRoot, { childList: true, subtree: true });
        }

        return () => {
            cancelled = true;
            observer && observer.disconnect();
        };
    }, [uiState.rootElement]);

    return target;
};
