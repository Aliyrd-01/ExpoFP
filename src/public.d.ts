class FloorPlan {
    constructor(options?: FloorPlanOptions);

    readonly ready: Promise<void>;
    readonly element: HTMLDivElement;
    readonly eventId: string;
    readonly dataUrl: string;
    readonly noOverlay: boolean;

    onBoothClick: (e: FloorPlanBoothClickEvent) => void;

    onFpConfigured: () => void;

    onDirection: (e: FloorPlanDirectionEvent) => void;

    selectBooth(nameOrExternalId: string): void;

    selectExhibitor(nameOrExternalId: string): void;

    selectCurrentPosition(point: { x: number; y: number; angle?: number; z?: string }, focus?: boolean): void;

    updateLayersVisibility(layers: { name: string; visible: boolean }[]): void;

    selectRoute(from: string, to: string, exceptUnaccessible: boolean): void;
}

interface FloorPlanOptions {
    element?: HTMLDivElement;
    eventId?: string;
    dataUrl?: string;
    noOverlay?: boolean;
    onBoothClick?: (e: FloorPlanBoothClickEvent) => void;
    onFpConfigured?: () => void;
    onDirection?: (e: FloorPlanDirectionEvent) => void;
}

interface FloorPlanBooth {
    id: number;
    name: string;
}

interface FloorPlanBoothClickEvent {
    target: FloorPlanBooth;
}

interface Point {
    x: number;
    y: number;
}

interface FloorPlanDirectionEvent {
    from: FloorPlanBooth;
    to: FloorPlanBooth;
    lines: { p0: Point; p1: Point }[];
    distance: string;
    time: number;
}

const ExpoFP: {
    FloorPlan: FloorPlanOptions;
};
