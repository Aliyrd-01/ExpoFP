class FloorPlan {
    constructor(options?: FloorPlanOptions);

    readonly ready: Promise<void>;
    readonly element: HTMLDivElement;
    readonly eventId: string;
    readonly dataUrl: string;
    readonly noOverlay: boolean;

    onBoothClick: (e: FloorPlanBoothClickEvent) => void;

    onFpConfigured: () => void;

    onDirection: (e: FloorPlanDeirectionEvent) => void;

    selectBooth(name: string): void;

    selectRoute(from: string, to: string, exceptUnaccessible: boolean): void;
}

interface FloorPlanOptions {
    element?: HTMLDivElement;
    eventId?: string;
    dataUrl?: string;
    noOverlay?: boolean;
    onBoothClick?: (e: FloorPlanBoothClickEvent) => void;
    onFpConfigured?: () => void;
    onDirection?: (e: FloorPlanDeirectionEvent) => void;
}

interface FloorPlanBooth {
    id: number;
    name: string;
}

interface FloorPlanBoothClickEvent {
    target: FloorPlanBooth;
}

interface FloorPlanDeirectionEvent {
    from: FloorPlanBooth;
    to: FloorPlanBooth;
    distance: string;
    time: number;
}

const ExpoFP: {
    FloorPlan: FloorPlanOptions;
};
