import * as twgl from 'twgl.js'
import Drawer from './Drawer'
import { createTextCanvas, createCircleCanvas } from './canvases';
// import Sprite, { createTextCanvas, SpriteItem } from './sprite'

let drawer: Drawer;

function initialize(gl: WebGLRenderingContext) {
    drawer = new Drawer(gl);

    const booths = store.getters.boothsArray as Booth[];
    const boothColor = Color.fromHex(__settings.colors.booths.default).toVec4();
    const borderColor = [1, 1, 1, 1] as Vec4;

    const dotCanvas = createCircleCanvas(2 * devicePixelRatio);
    const dotW = dotCanvas.width / devicePixelRatio / 2;
    const dotH = dotCanvas.width / devicePixelRatio / 2;

    function addLabel(b: Booth, fontSize: number, sizeName) {
        const r = b.rect;
        const upscale = 1;
        const canvas = createTextCanvas(b.name, fontSize * upscale * devicePixelRatio);
        const w = canvas.width / devicePixelRatio / 2 / upscale;
        const h = canvas.height / devicePixelRatio / 2 / upscale;

        drawer.addObject({
            id: `bLab${sizeName}${b.id}`,
            center: [r.cx, r.cy],
            deltas: [0, 0, 0, 0],
            deltasPx: [-w, -h, w, h],
            canvasTmp: canvas,
            order: 20
        });
    }


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
        {
            // dots
            drawer.addObject({
                id: `bLabDot${b.id}`,
                center: [r.cx, r.cy],
                deltas: [0, 0, 0, 0],
                deltasPx: [-dotW, -dotH, dotW, dotH],
                canvasTmp: dotCanvas,
                order: 20
            });

            addLabel(b, 16, 'XS')
            // addLabel(b, 12, 'S')
            // addLabel(b, 16, 'M')
            // addLabel(b, 20, 'L')
        }

        // borders
        drawer.addObject({
            id: `bBorderT${b.id}`,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, r.w / 2, -r.h / 2],
            deltasPx: [-.5, -.5, .5, .5],
            color: borderColor,
            order: 40
        });
        drawer.addObject({
            id: `bBorderL${b.id}`,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, -r.w / 2, r.h / 2],
            deltasPx: [-.5, -.5, .5, .5],
            color: borderColor,
            order: 40
        });
        drawer.addObject({
            id: `bBorderB${b.id}`,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, r.h / 2, r.w / 2, r.h / 2],
            deltasPx: [-.5, -.5, .5, .5],
            color: borderColor,
            order: 40
        });
        drawer.addObject({
            id: `bBorderR${b.id}`,
            center: [r.cx, r.cy],
            deltas: [r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            deltasPx: [-.5, -.5, .5, .5],
            color: borderColor,
            order: 40
        });
    }
}

// Dot, XS, S, M, L

// id to factors
const mapBoothFactors = new Map<number, number[]>();

function prepareBoothDetailsFactors() {
    if (mapBoothFactors.size) return;
    const booths = store.getters.boothsArray as Booth[];
    // we can convert svg to px and see how px fits
    for (const b of booths) {
        const r = b.rect;

        const ar = [];
        {
            // deltapx - the real size in pixels
            const p = drawer.getObject(`bLabXS${b.id}`).deltasPx
            const width = -p[0]+p[2];
            const height = -p[1]+p[3];
            const xFactor = r.w / width;
            const yFactor = r.h / height;
            const factor = Math.min(xFactor, yFactor);
            ar.push(factor);
        }

        mapBoothFactors.set(b.id, ar);
    }
}

function updateVisibleDetails(pxscale: number) {
    const booths = store.getters.boothsArray as Booth[];
    for (const b of booths) {
        const ff = mapBoothFactors.get(b.id);
        if (pxscale < ff[0]){
            drawer.updateVisible(`bLabDot${b.id}`, false);
            drawer.updateVisible(`bLabXS${b.id}`, true);
        } else {
            drawer.updateVisible(`bLabDot${b.id}`, true);
            drawer.updateVisible(`bLabXS${b.id}`, false);
        }
    }
}

export function drawBooths(gl: WebGLRenderingContext, u_matrix: any, pxscale: number) {
    // draw booths there 
    if (!drawer || drawer.gl !== gl) initialize(gl);
    prepareBoothDetailsFactors();

    // TODO: determine what to show for specific booth
    // see how it was done in old version

    updateVisibleDetails(pxscale);

    drawer.draw(u_matrix, pxscale);
}



