// interface FloorPlanOptions {
//     element?: HTMLDivElement;
//     eventId?: string;
//     dataUrl?: string;
//     noOverlay?: boolean;
//     onBoothClick?: (e: FloorPlanBoothClickEvent) => void;
// }

// interface FloorPlanBooth {
//     id: number;
//     name: string;
// }

// interface FloorPlanBoothClickEvent {
//     target: FloorPlanBooth;
// }

// type RequiredFloorPlanOptions = Required<FloorPlanOptions>;
// type ChangableOptions = Pick<keyof FloorPlanOptions, "onBoothClick">;

// interface FloorPlan
//     extends Readonly<Without<RequiredFloorPlanOptions, ChangableOptions>>,
//         Pick<RequiredFloorPlanOptions, ChangableOptions> {
//     ready: Promise<void>;
//     selectBooth(name: string): void;
// }

// class FloorPlan {
//     constructor(options?: FloorPlanOptions);
// }

// const ExpoFP: {
//     FloorPlan: FloorPlanOptions;
// };

// type Without<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
// // 