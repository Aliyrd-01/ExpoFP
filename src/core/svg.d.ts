interface SvgJson {
    area: SvgRect;
    viewBox: SvgRect;
    layers: SvgLayer[];
    booths: SvgBooth[];
    pending?: boolean;
}

type SvgMeshJson = SvgMesh[];
type SvgMesh = { positions: SvgMeshPosition[]; cells: SvgMeshCell[] };
type SvgMeshCell = [number, number, number];
type SvgMeshPosition = [number, number];

interface SvgBooth {
    name: string;
    rotate: number;
    rect: SvgRect;
    shapes: SvgShape[];
    noLabels: boolean;
    availColor: string;
    soldColor: string;
    holdColor: string;
    color: string;
    type:string;
}

interface SvgLayer {
    shapes: SvgShape[];
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

type SvgShape = SvgRectShape | SvgPathShape;
