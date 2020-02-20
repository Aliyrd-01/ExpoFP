import Rect from "../core/Rect";
import Size from "../core/Size";
import { BoothStateProvider } from "../core/Booth";

interface Drawer {
    setUpdatables(m: DrawerUpdatables): void;
    dispose();
}

interface DrawerConfig {
    canvas: HTMLCanvasElement,
    pixelRatio: number,
    // config: DrawerConfig,
    svg: SvgJson,
    meshUrl: string,
    booths: Booth[]
    borderColor: string;
    borderWidth: number;
    exhibitorNames: Record<number, string>,
    __efpDebug: boolean;
}

interface DrawerUpdatables extends BoothStateSeriazable {
    matrix: Float32Array;
    ptscale: number;
    canvasVisibleRectPt: Rect;
    canvasSizePt: Size;
    dimmed: boolean;
}

type BoothStateSeriazable = Serializable<Omit<BoothStateProvider, "exhibitorByIdMap">>;

// interface DrawerWorkerMessageBase {
//     type: string;
//     id: number;
//     params: any[];
// }

interface DrawerWorkerCreateMessage {
    type: "create";
    id: number;
    params: [DrawerConfig];
}

interface DrawerWorkerSetUpdatablesMessage {
    type: "setUpdatables";
    id: number;
    params: [DrawerUpdatables];
}

interface DrawerWorkerDisposeMessage {
    type: "dispose";
    id: number;
    params?: undefined
}

type DrawerWorkerMessage = DrawerWorkerCreateMessage | DrawerWorkerSetUpdatablesMessage | DrawerWorkerDisposeMessage;
