declare global {
    interface Window {
        ResizeObserver: typeof ResizeObserver;
    }
}

interface ResizeObserver {
    observe(target: Element): void;
    unobserve(target: Element): void;
    disconnect(): void;
}

interface ResizeObserverEntry {
    readonly target: Element;
    readonly contentRect: DOMRectReadOnly;
}

declare var ResizeObserver: {
    prototype: ResizeObserver;
    new (callback: ResizeObserverCallback): ResizeObserver;
};

type ResizeObserverCallback = (entries: ResizeObserverEntry[], observer: ResizeObserver) => void;
