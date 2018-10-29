import { svgWidth, svgHeight } from '@/tools/svg'
// import { getFpDestinationRectangle } from './utils';
// import c from './drawing-context'
// import { drawFpGrid, drawDebug } from './draw-debug';
import settings from '@/settings';
// import { drawSprites } from './draw-sprites';
// export { getBoothIdFromClientXy } from './booth-by-xy';

let canvas: HTMLCanvasElement;
let context: WebGLRenderingContext;

export function initialize(canvasParam: HTMLCanvasElement) {
    // draw all booths for now
    canvas = canvasParam;
    context = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    // define some shader programs, etc

    
}