// import { ZoomTransform } from "d3-zoom";
// import Rect from "../core/Rect";
// import Size from "../core/Size";
// import FloorPlanReady from "../floorplan.ready";


// // drawing is 
// // matrix calculations -> for given positions, canvas size... - define ptscalse, unzoommedmatrixes, transforms to -1..1 for canvas, etc.
// // drawing itself -> make svg object be transformed into webgl data (using matrix data and svg)
// // let's separate this
// // there should be some orchestrating class anyway
// // Matrix class - supply zoom, canvas, etc -> receive observable matrix, ptscale, etc
// // Drawer class - supply canvas, svg, booths, matrix (observable by Drawer) -> have it auto-drawen in canvas
// // steps to achieve
// // implement Matrix class as a separate thing
// // create DrawerAdapter that accepts matrix as a parameter
// // create Drawer that draws only bg

// export default class Drawer {
//     constructor(private readonly options: DrawerOptions) {}

//     setZoom(zoom: ZoomTransform) {}
//     // hover, active, default
//     updateBoothState(id: string) {}
//     updatePixelRatio(val: number) {}

//     dispose() {
//         // try to release all resources
//     }
// }

// // to be moved somewhere
// class DrawerAdapter {
//     constructor(fp: FloorPlanReady, updatable: boolean) {
//         // take fp
//     }

//     notifyCanvasChanged(){
//         // 
//     }

//     setZoom(){
//         // sets zoom of drawer,
//         // all the rest will come from store
//         // pixelratio is also configurable
//     }
// }

// // use mobx internally - for drawers to get updated when needed
// // but somehow release when drawer gets disposed

// export interface DrawerOptions {
//     canvas: HTMLCanvasElement;
//     booths: DrawerBooth[];
//     // we don't need this because caller won't call update... for this
//     //updatable: boolean;
//     pixelRatio: number;
// }

// interface DrawerBooth {
//     id: number;
//     name: string;
//     shape: DrawerBoothShape;
// }

// interface DrawerBoothShape {
//     rect: Rect;
//     //...
// }

// interface DrawerSvg {
//     size: Size;
//     area: Rect;
// }
