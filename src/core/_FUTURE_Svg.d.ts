interface SvgJson {
    area: SvgArea;
    layers: SvgLayer[];
    booths: SvgBooth[];
}

interface SvgMeshJson {
    triangles: Triangle[];
}

interface SvgArea {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

interface SvgBooth {
    name: string;
    rotation: number;
    rect: SvgRect;
    shapes: DrawerShape[];
    // add more fields that are received from attributes
}

interface SvgLayer {
    shapes: DrawerShape[];
}

interface SvgRectShape extends SvgRect {
    fill: string;
}

interface SvgRect {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

interface SvgPathShape {
    meshIndex: number;
    fill: string;
}

type DrawerShape = DrawerRectShape | DrawerPathShape;
