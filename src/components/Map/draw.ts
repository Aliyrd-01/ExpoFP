import { sizeCanvasToParentElement } from './utils';

import configMatrix from './config-matrix';
import configDim from './config-dim';
import configBg from './config-bg';
import configBooths from './config-booths';
import settings from '@/settings';


// type AnyDrawer = Drawer | TriangleDrawer;
// var a: Drawer;
// var b: AnyDrawer;
// b = a;

let canvas: HTMLCanvasElement;
let gl: WebGLRenderingContext;
let zoomTranform = { k: 1, x: 0, y: 0 };
let visibleRect: Rect;
const zoomDimensionSubscribers: (() => void)[] = [];
const drawersByType = new Map<string, AnyDrawer>();
export const allDrawers: AnyDrawer[] = [];

interface AnyDrawer {
    draw();
    matrix: number[][];
    ptscale?: number;
    dim: number;
}


export function getCanvas() { return canvas; }
export function getZoomTransform() { return zoomTranform; }
export function getVisibleRect() { return visibleRect; }
export function applyZoomTransform(transform: typeof zoomTranform) {
    zoomTranform = transform;
    fireZoomDimensionsChange();
}
export function applyVisibleRect(rect: Rect) {
    visibleRect = rect;
    fireZoomDimensionsChange();
}
export function subscribeZoomDimensionsChange(cb: () => void) { zoomDimensionSubscribers.push(cb); }


function fireZoomDimensionsChange() { zoomDimensionSubscribers.forEach(x => x()); }

export function requireDrawer<T extends AnyDrawer>(id: string,
    TypeClass: new (gl: WebGLRenderingContext) => T): T {
    let d = drawersByType.get(id) as T;
    if (!d) {
        d = new TypeClass(gl);
        drawersByType.set(id, d);
        allDrawers.push(d);
    }
    return d;
}

const updateQueue: (() => void)[] = [];

export function requireUpdate(u: () => void): void {
    updateQueue.push(u);
    requireRedraw();
}

let requestedFrame: number;
function requireRedraw() {
    if (!requestedFrame) requestedFrame = window.requestAnimationFrame(draw);
}

const instantDraw = false;
function draw() {
    showFps();//if (__settings.debug) 
    requestedFrame = undefined;

    const queue = updateQueue.slice(0);
    updateQueue.length = 0;

    for (const u of queue) {
        u();
    }
    // gl.clearColor(...ColorInfo.fromHex(settings.colors.base).toVec4());
    // Clear the context with the newly set color. This is
    // the function call that actually does the drawing.
    // gl.clear(gl.COLOR_BUFFER_BIT);
    
    for (var d of allDrawers) {
        d.draw();
    }

    if (instantDraw) {
        requireRedraw();
    }
}

let then = 0;
let prevFps = [];
let prevHtml = '';
function showFps() {
    const now = performance.now() * 0.001;
    const deltaTime = now - then;
    then = now;
    const roundTo = 2;
    const fps = Math.round(1 / deltaTime / 2) * 2;
    prevFps.push(fps);
    if (prevFps.length > 20) prevFps.shift();
    const avgFps = prevFps.reduce((sume, el) => sume + el, 0) / prevFps.length;
    const html = avgFps.toFixed(0);
    if (prevHtml !== html) {
        document.getElementById("fps").innerHTML = html;
        prevHtml = html;
    }
}

export function initialize(canvas1: HTMLCanvasElement, visibleRect1: Rect) {
    canvas = canvas1;
    visibleRect = visibleRect1;
    sizeCanvasToParentElement(canvas);
    window.addEventListener('resize', () => {
        sizeCanvasToParentElement(canvas);
        gl.viewport(0, 0, canvas.width, canvas.height);
        fireZoomDimensionsChange();
    });

    const options = {};
    gl = canvas.getContext("webgl", options) || canvas.getContext("experimental-webgl", options) as any;
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true as any);

    
    configBg();
    configMatrix();
    configDim();
    configBooths();

    requireRedraw();
}


