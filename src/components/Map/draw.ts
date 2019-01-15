import { svgWidth, svgHeight } from '@/tools/svg'
import { m4 } from 'twgl.js'
import { drawBg } from './draw-bg'
import configBooths from './config-booths';
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

//type requireDrawer = 

// export interface DrawerConfigurer {
//     //configure(requireDrawer: (type:string, order:number) => Drawer, requireUpdateCallback: () => void):void;
//     //update(allDrawers: Drawer[]);
// }

export interface Updatable {
    update(): void;
}

// export type RequireDrawerFunc = typeof requireDrawer;
// export type RequireUpdateFunc = typeof requireUpdate;

// export interface ConfigureDrawerFunc {
//     (requireDrawer: RequireDrawerFunc, requireUpdate: RequireUpdateFunc): void;
// }

// export interface RequireDrawerFunc{
//     (type: string, order: number): Drawer;
// }

// export interface 
export function requireDrawer(type: string): Drawer {
    return null;
}

export function getAllDrawers(): Drawer[] {
    return [];
}

interface UpdateFunc {
    (): void;
    (allDrawers: Drawer[]): void;
}

export function requireUpdate(u: UpdateFunc): void {
    // add to set and then call all and clean set after it
}



// export type configureDrawerFunc = (requireDrawer: (type: string, order: number) => Drawer, requireUpdateCallback: () => void) => { update(): void }[];

var a: ConfigureDrawerFunc = (r, ru) => {
    return [];
}

// let animatedFrame: number;

//const configurers = [] as DrawerConfigurer[];




function draw() {

}

export function initialize(canvas1: HTMLCanvasElement) {
    canvas = canvas1;
    sizeCanvas(canvas);
    const options = {};
    gl = canvas.getContext("webgl", options) || canvas.getContext("experimental-webgl", options) as any;
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true as any);

    // initialize all objects to draw
    // drawer = new Drawer(gl);


    configBooths();

    //configurers.push(...getBoothsDrawerConfigurers());


    // for (const conf of configurers) {
    //     conf.configure(drawer, () => requireUpdate.push(conf));
    // }




    // call draw
    draw();
}


