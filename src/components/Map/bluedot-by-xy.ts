import { Drawer } from "./drawing/Drawer1";
import { m4 } from "twgl.js";
import store from "../../store";

function isPointInCircle(x: number, y: number, circleX: number, circleY: number, radius: number) {
    const distance = Math.sqrt((x - circleX) ** 2 + (y - circleY) ** 2);
    return distance <= radius;
}

export function getBluedotFromClientXy(x: number, y: number, drawer: Drawer) {
    const pxSvgMatrix = drawer.getPxSvgMatrix();
    const xys = m4.transformPoint(pxSvgMatrix, [x, y, 1], null);
    const xs = xys[0];
    const ys = xys[1];

    let scale = Math.max(drawer.ptscale < 1 ? Math.round(drawer.ptscale * 10) / 10 : Math.round(drawer.ptscale), 0.3);

    const result = store.routeStore.bluedots.find(bluedot => {
        const radius = 70 * (drawer.pixelRatio * 0.4) * scale / 2;
        let layer = store.layerStore.findLayer(bluedot.z);

        if (!layer) {
            return isPointInCircle(xs, ys, bluedot.x, bluedot.y, radius);
        }

        return isPointInCircle(xs, ys, bluedot.x, bluedot.y, radius) && layer && layer.visible;
    })

    return result;
}