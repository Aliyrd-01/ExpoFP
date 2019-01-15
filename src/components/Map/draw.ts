import { sizeCanvasToParentElement } from './utils';
import Drawer from './Drawer';
import configMatrix from './config-matrix';
import configBg from './config-bg';
import configBooths from './config-booths';


let canvas: HTMLCanvasElement;
let gl: WebGLRenderingContext;
let zoomTranform = { k: 1, x: 0, y: 0 };
const zoomDimensionSubscribers: (() => void)[] = [];
const drawersByType = new Map<string, Drawer>();
export const allDrawers: Drawer[] = [];

export function getCanvas() { return canvas; }
export function getZoomTransform() { return zoomTranform; }
export function applyZoomTransform(transform: typeof zoomTranform) {
    zoomTranform = transform;
    fireZoomDimensionsChange();
}
export function subscribeZoomDimensionsChange(cb: () => void) { zoomDimensionSubscribers.push(cb); }

function fireZoomDimensionsChange() { zoomDimensionSubscribers.forEach(x => x()); }

export function requireDrawer(type: string): Drawer {
    let d = drawersByType.get(type);
    if (!d) {
        d = new Drawer(gl);
        drawersByType.set(type, d);
        allDrawers.push(d);
    }
    return d;
}

const updateQueue: (() => void)[] = [];
let requestedFrame: number;
export function requireUpdate(u: () => void): void {
    updateQueue.push(u);
    if (!requestedFrame) requestedFrame = window.requestAnimationFrame(draw);
}

function draw(now) {
    requestedFrame = undefined;
    for (const u of updateQueue) {
        u();
    }
    updateQueue.length = 0;

    for (var d of allDrawers) {
        d.draw();
    }
}

export function initialize(canvas1: HTMLCanvasElement) {
    canvas = canvas1;
    sizeCanvasToParentElement(canvas);
    window.addEventListener('resize', () => { sizeCanvasToParentElement(canvas); fireZoomDimensionsChange(); });

    const options = {};
    gl = canvas.getContext("webgl", options) || canvas.getContext("experimental-webgl", options) as any;
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true as any);


    configBg();
    configMatrix();
    // configBooths();

    window.requestAnimationFrame(draw);
}


