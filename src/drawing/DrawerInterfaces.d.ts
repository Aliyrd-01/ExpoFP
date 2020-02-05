import Rect from "../core/Rect";
import Size from "../core/Size";

interface Drawer {
    setUpdatables(m: DrawerUpdatables): void;
    dispose();
}

interface DrawerConfig {
    borderWidth: number;
}

interface DrawerUpdatables {
    matrix: Float32Array;
    ptscale: number;
    canvasVisibleRectPt: Rect;
    canvasSizePt: Size;
    dimmed: boolean;
    // selectedBooths: Iterable<string>;
    boothExhibitors: { [name: string]: string[] };
}

// type DrawerBooth = DrawerSpecialBooth | DrawerRegularBooth;

// interface DrawerBoothBase {
//     name: string;
//     rect: Rect;
//     noLabels: boolean;
//     rotate: number;
//     paths: SvgPathShape[];
//     pathsWithRect: boolean;
//     error: boolean;
// }

// interface DrawerRegularBooth extends DrawerBoothBase {
//     size: string;
//     availColor: string;
//     special?: undefined;
// }

// interface DrawerSpecialBooth extends DrawerBoothBase {
//     special: true;
//     color: string;
// }

// interface DrawerLayer {
//     shapes: DrawerShape[];
// }

// interface DrawerRectShape {
//     x1: number;
//     y1: number;
//     x2: number;
//     y2: number;
//     fill: string;
// }

// interface DrawerPathShape {
//     meshIndex: number;
//     fill: string;
// }

// type DrawerShape = DrawerRectShape | DrawerPathShape;
