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

    onDetails: (e: FloorPlanDetailsEvent) => void;

    onExhibitorCustomButtonClick: (e: FloorPlanCustomButtonEvent) => void;

    selectBooth(nameOrExternalId: string): void;

    selectExhibitor(nameOrExternalId: string): void;

    selectCurrentPosition(
        //
        point: { x: number; y: number; angle?: number; z?: string; lat?: number; lng?: number },
        focus?: boolean,
        icon?: number // 0- blue dot, 1- YAH icon
    ): void;

    updateLayerVisibility(layer: string, visible: boolean): void;

    selectRoute(from: string, to: string, onlyAccessible: boolean): void;

    unstable_destroy(): void;
}

interface FloorPlanOptions {
    element?: HTMLDivElement;
    eventId?: string;
    dataUrl?: string;
    noOverlay?: boolean;
    allowConsent?: boolean;
    onBoothClick?: (e: FloorPlanBoothClickEvent) => void;
    onFpConfigured?: () => void;
    onDirection?: (e: FloorPlanDirectionEvent) => void;
    onDetails?: (e: FloorPlanDetailsEvent) => void;
    onExhibitorCustomButtonClick?: (e: FloorPlanCustomButtonEvent) => void;
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

interface FloorPlanDetailsEvent {
    type: "booth" | "exhibitor" | "route";
    id: string;
    name: string;
    externalId: string;
}

interface FloorPlanCustomButtonEvent {
    externalId: string;
    buttonNumber: number;
    buttonUrl: string;
    preventDefault: () => void;
}

const ExpoFP: {
    FloorPlan: FloorPlanOptions;
};
