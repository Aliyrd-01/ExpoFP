class FloorPlan {
    constructor(options?: FloorPlanOptions);

    readonly ready: Promise<void>;
    readonly element: HTMLDivElement;
    readonly eventId: string;
    readonly dataUrl: string;
    readonly noOverlay: boolean;
    onFpConfigured: () => void;
    onBoothClick: (e: FloorPlanBoothClickEvent) => void;
    onDirection: (e: FloorPlanDirectionEvent) => void;
    selectBooth(name: string | string[]): void;
    selectCurrentPosition(point: { x: number; y: number }, focus: boolean): void;
    selectRoute(from: string, to: string, exceptUnaccessible: boolean): void;
}

interface FloorPlanOptions {
    element?: HTMLDivElement;
    eventId?: string;
    dataUrl?: string;
    noOverlay?: boolean;
    onBoothClick?: (e: FloorPlanBoothClickEvent) => void;
}

interface FloorPlanBooth {
    id: number;
    name: string;
}

interface FloorPlanBoothClickEvent {
    target: FloorPlanBooth;
}

interface FloorPlanDirectionEvent {
    from: FloorPlanBooth;
    to: FloorPlanBooth;
    points: { x: number; y: number }[];
    distance: string;
    time: number;
}

const ExpoFP: {
    FloorPlan: FloorPlanOptions;
};
