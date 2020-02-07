import Rect from "../core/Rect";
import Size from "../core/Size";
import { BoothStateProvider } from "../core/Booth";

interface Drawer {
    setUpdatables(m: DrawerUpdatables): void;
    dispose();
}

interface DrawerConfig {
    borderWidth: number;
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
    params: [HTMLCanvasElement | OffscreenCanvas, number, DrawerConfig, SvgJson, string, Booth[]];
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
