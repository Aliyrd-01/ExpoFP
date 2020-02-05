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
    // boothExhibitors: { [name: string]: number[] };
}

