
type OverlaySize = "full" | "medium" | "small";
type OverlayPosition = "left" | "bottom";
type MapOccupied = null | "left" | "bottomSmall" | "bottomMedium";

type ZoomTransform = typeof d3.zoomIdentity; 

declare const EFP_EXPO: string;
declare const EFP_LIVE: boolean;
