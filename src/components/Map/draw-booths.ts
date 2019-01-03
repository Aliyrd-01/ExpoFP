import * as twgl from 'twgl.js'
import Drawer from './Drawer'
import { createTextCanvas } from './canvases';
// import Sprite, { createTextCanvas, SpriteItem } from './sprite'

let drawer: Drawer;

function initialize(gl: WebGLRenderingContext) {
    drawer = new Drawer(gl);

    const booths = store.getters.boothsArray as Booth[];
    const boothColor = Color.fromHex(__settings.colors.booths.default).toVec4();


    for (const b of booths) {
        const r = b.rect;

        // booths themselves
        drawer.addObject({
            id: `b${b.id}`,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            deltasPx: [.5, .5, -.5, -.5],
            color: boothColor,
            order: 10
        });

        // labels
        const upscale = 1;
        const canvas = createTextCanvas(b.name, 16 * upscale * devicePixelRatio);
        const w = canvas.width / devicePixelRatio / 2 / upscale;
        const h = canvas.height / devicePixelRatio / 2 / upscale;

        drawer.addObject({
            id: `bLab2${b.id}`,
            center: [r.cx, r.cy],
            deltas: [0, 0, 0, 0],
            deltasPx: [-w, -h, w, h],
            canvas,
            order: 20
        });
    }
}

export function drawBooths(gl: WebGLRenderingContext, u_matrix: any, u_pxscale: any) {
    // draw booths there 
    if (!drawer || drawer.gl !== gl) initialize(gl);

    drawer.draw(u_matrix, u_pxscale);
}



