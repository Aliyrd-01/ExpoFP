import Rect from "../core/Rect";
import Size from "../core/Size";

interface Drawer {
    setUpdatables(m: DrawerUpdatables): void;
    dispose();
}

interface DrawerUpdatables {
    matrix: Float32Array;
    ptscale: number;
    canvasVisibleRectPt: Rect;
    canvasSizePt: Size;
    dimmed: boolean;
}

interface DrawerLayer {
    shapes: DrawerShape[];
}

interface DrawerRectShape {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    fill: string;
}

interface DrawerPathShape {
    meshIndex: number;
    fill: string;
}

type DrawerShape = DrawerRectShape | DrawerPathShape;
