import * as twgl from 'twgl.js'
import Drawer from './Drawer'
// import Sprite, { createTextCanvas, SpriteItem } from './sprite'

let drawer: Drawer;

function initialize(gl: WebGLRenderingContext) {
    drawer = new Drawer(gl);

    const booths = store.getters.boothsArray as Booth[];
    const boothColor = Color.fromHex(__settings.colors.booths.default).toVec4();

    for (const b of booths) {
        // add booths there
        const r = b.rect;
        drawer.addObject({
            id: `b${b.id}`,
            center: [r.cx, r.cy],
            deltas: [-r.w/2, -r.h/2, r.w/2, r.h/2],
            deltasPx: [.5, .5, -.5, -.5],
            color: boothColor
        });
    }
}

export function drawBooths(gl: WebGLRenderingContext, u_matrix: any, u_pxscale: any) {
    // draw booths there 
    if (!drawer || drawer.gl !== gl) initialize(gl);

    drawer.draw(u_matrix, u_pxscale);
}



