import { svgWidth, svgHeight } from '@/tools/svg'
import { m4 } from 'twgl.js'
import { drawBg } from './draw-bg'
import getBoothsDrawerConfigurers from './config-booths'
import { sizeCanvas } from './utils';
import Drawer from './Drawer';


let canvas: HTMLCanvasElement;
let gl: WebGLRenderingContext;
let drawer: Drawer;

let zoomTranform: ZoomTranform = { k: 1, x: 0, y: 0 };

type ZoomTranform = { k: number, x: number, y: number };

export function applyZoomTransform(transform: { k: number, x: number, y: number }) {
    zoomTranform = transform;
}


export interface DrawerConfigurer {
    configure(requireDrawer: (type:string, order:number) => Drawer, requireUpdateCallback: () => void);
    update(requireDrawer: (type:string) => Drawer, allDrawers: Drawer[]);
}

// let animatedFrame: number;

const configurers = [] as DrawerConfigurer[];
const requireUpdate = [] as DrawerConfigurer[];

function draw() {

}

export function initialize(canvas1: HTMLCanvasElement) {
    canvas = canvas1;
    sizeCanvas(canvas);
    const options = {};
    gl = canvas.getContext("webgl", options) || canvas.getContext("experimental-webgl", options) as any;
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true as any);

    // initialize all objects to draw
    drawer = new Drawer(gl);

    configurers.push(...getBoothsDrawerConfigurers());


    for (const conf of configurers) {
        conf.configure(drawer, () => requireUpdate.push(conf));
    }




    // call draw
    draw();
}


