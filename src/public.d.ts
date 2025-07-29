class FloorPlan {
    constructor(options?: FloorPlanOptions);

    readonly ready: Promise<void>;
    readonly element: HTMLDivElement;
    readonly eventId: string;
    readonly dataUrl: string;
    readonly noOverlay: boolean;
    readonly offHistory: boolean;
    readonly allowConsent: boolean;
    readonly onInit;

    onBoothClick(e: FloorPlanBoothClickEvent): void;

    onBookmarkClick(e: FloorPlanBookmarkClickEvent): void;

    onVisitedClick(e: FloorPlanVisitedClickEvent): void;

    onCategoryClick(e: FloorPlanCategoryClickEvent): void;

    /**
     * @deprecated
     * The onFpConfigured method is deprecated. Use onInit instead.
     */
    onFpConfigured(): void;

    onDirection(e: FloorPlanDirectionEvent): void;

    onDetails(e: FloorPlanDetailsEvent): void;

    onExhibitorCustomButtonClick(e: FloorPlanCustomButtonEvent): void;

    onGetCoordsClick(e: FloorPlanGetCoordsEvent): void;

    onMarkerClick(e: FloorPlanMarkerEvent): void;

    selectBooth(nameOrExternalId: string): void;

    selectExhibitor(nameOrExternalId: string): void;

    selectRoute(from: RouteWaypoint, to: RouteWaypoint): void;

    selectRoute(waypoints: RouteWaypoint[]): void;

    getOptimizedRoutes(waypoints: RouteWaypoint[]): RouteInfo[];

    selectCurrentPosition(point: CurrentPosition, focus: boolean, icon?: number): void;

    setBookmarks(bookmarks: { name: string; bookmarked: boolean }[]): void;

    setMarkers(markersData: MarkersData): void;

    updateLayerVisibility(layer: string, visible: boolean): void;

    getCenterCoordinates(): FloorPlanGetCoordsEvent;

    applyParameters(queryRaw: string): void;

    exhibitorsList(): FloorPlanExhibitor[];

    boothsList(): FloorPlanBooth[];

    categoriesList(): FloorPlanCategory[];

    selectCategory(nameOrSlug?: string): void;

    getVisibility(): Visibility;

    setVisibility(visibility: Visibility): void;

    findLocation(): void;

    zoomIn(): void;

    zoomOut(): void;

    switchView(): void;

    fitBounds(): void;

    getBoothRect(name: string): Rect;

    convertToGeo(x: number, y: number): [number, number] | never;

    unstable_destroy(): void;

    highlightExhibitors(externalIds: string[]): void;

    highlightBooths(externalIds: string[]): void;

    onCurrentPositionChanged(point: CurrentPosition): void;

    search(term: string): Promise<{ item: unknown, score: number }[]>;

    getFloors(): Floor[];

    onFloorActivated(floor: Floor): void;

    activateFloor(floorId: { name?: string, index?: number }): void;
}

interface FloorPlanOptions {
    element?: HTMLDivElement;
    eventId?: string;
    previewMode?: boolean;
    dataUrl?: string;
    noOverlay?: boolean;
    offHistory?: boolean;
    allowConsent?: boolean;
    onBoothClick?: (e: FloorPlanBoothClickEvent) => void;
    onBookmarkClick?: (e: FloorPlanBookmarkClickEvent) => void;
    onVisitedClick?: (e: FloorPlanVisitedClickEvent) => void;
    onCategoryClick?: (e: FloorPlanCategoryClickEvent) => void;
    /**
     * @deprecated
     * The onFpConfigured method is deprecated. Use onInit instead.
     */
    onFpConfigured?: () => void;
    onDirection?: (e: FloorPlanDirectionEvent) => void;
    onDetails?: (e: FloorPlanDetailsEvent) => void;
    onExhibitorCustomButtonClick?: (e: FloorPlanCustomButtonEvent) => void;
    onMarkerClick?: (e: FloorPlanMarkerEvent | undefined) => void;
    onGetCoordsClick?: (e: FloorPlanGetCoordsEvent) => void;
    onInit?: (fp: FloorPlan) => void;
    onCurrentPositionChanged?: (point: CurrentPosition) => void;
    onFloorActivated?: (floor: Floor) => void;
}

interface Layer {
    name: string;
    description: string;
}

interface FloorPlanBoothBase {
    id: number;
    externalId: string;
    name: string;
    layer: Layer;
}

interface FloorPlanBooth extends FloorPlanBoothBase {
    id: number;
    name: string;
    externalId: string;
    isSpecial: boolean;
    exhibitors: number[];
    layer: Layer;
    meta: Record<string, string>;
    description: string;
    entity: Entity;
}

interface FloorPlanBoothClickEvent {
    target: FloorPlanBoothBase;
}

interface Point {
    x: number;
    y: number;
}

interface FloorPlanBookmarkClickEvent {
    name: string;
    bookmarked: boolean;
    externalId: string;
}

interface FloorPlanVisitedClickEvent {
    name: string;
    visited: boolean;
    externalId: string;
}

interface FloorPlanCategoryClickEvent extends FloorPlanCategory {}

interface FloorPlanDirectionEvent {
    from: FloorPlanBoothBase;
    to: FloorPlanBoothBase;
    lines: { p0: Point; p1: Point }[];
    distance: string;
    time: number;
}

interface FloorPlanDetailsEvent {
    type: "booth" | "exhibitor" | "route" | "category";
    id: string;
    name: string;
    externalId: string;
    /// Value depends on the type of event
    /// if the type is 'booth' this value contains the same value as 'name'
    /// if the type is 'exhibitor' this value contains the  assigned booths names (the first booth name takes from the onBoothClick event)
    /// if the the type is 'route' this value contains "from" and "to" booths name.
    boothsNames: string[];
}

interface FloorPlanCustomButtonEvent {
    externalId: string;
    buttonNumber: number;
    buttonUrl: string;
    preventDefault: () => void;
}

interface FloorPlanGetCoordsEvent extends Point {
    z: string | null;
}

interface FloorPlanMarkerEvent extends Point {
    id: string;
    z?: number | string;
}

interface FloorPlanExhibitor {
    id: number;
    name: string;
    externalId: string;
    booths: number[];
    entity: Entity;
    slug: string;
}

interface FloorPlanCategory {
    id: number;
    name: string;
    exhibitors: number[];
    entity: Entity;
    slug: string;
}

type RouteWaypoint = string | CurrentPosition;

interface RouteInfo {
    waypoints: RouteWaypoint[];
}

interface ExpoData {
    booths: FloorPlanBooth[];
    exhibitors: FloorPlanExhibitor[];
    categories: FloorPlanCategory[];
}

const ExpoFP: {
    FloorPlan: FloorPlanOptions;
};

type FloorPlanIcon = "departure" | "destination" | "direction" | "transition" | "transition_up" | "transition_down" | "kiosk-arrow" | "kiosk-label";

interface LayerPoint extends Point {
    layer: string;
}

interface Entity {
    type: "booth" | "category" | "exhibitor" | "schedule" | "language" | "heatmap-yah" | "route-cut-in";
    variant?: "regular" | "special";
}

interface FloorPlanSchedule {
    id: number;
    externalId: string;
    boothId: number;
    exhibitorId: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    link: string;
    entity: Entity;
    isEnded: boolean;
}

interface FloorPlanLanguage {
    id: number;
    name: string;
    entity: Entity;
    selected: boolean;
}

interface FloorPlanHeatmapYah {
    id: string;
    name: string;
    viewCount: number;
    x: number;
    y: number;
    z: number | string;
    entity: Entity;
}

type FloorPlanEntity =
    | FloorPlanBooth
    | FloorPlanCategory
    | FloorPlanExhibitor
    | FloorPlanSchedule
    | FloorPlanLanguage
    | FloorPlanHeatmapYah;

interface VisibleLayer {
    name: string;
    shortName: string;
    index: number;
}

interface Floor {
    name: string;
    shortName: string;
    description: string;
    active: boolean;
    disabled: boolean;
    index: number;
}
