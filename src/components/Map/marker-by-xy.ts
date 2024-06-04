import { Drawer } from "./drawing/Drawer1";
import { m4 } from "twgl.js";
import store from "../../store";

type IconType = "bluedot";

function isPointInCircle(x: number, y: number, circleX: number, circleY: number, radius: number) {
    const distance = Math.sqrt((x - circleX) ** 2 + (y - circleY) ** 2);
    return distance <= radius;
}

function getRadius(drawer: Drawer, iconType: IconType) {
    if (iconType === "bluedot") {
        const scale = Math.max(drawer.ptscale < 1 ? Math.round(drawer.ptscale * 10) / 10 : Math.round(drawer.ptscale), 0.3);
        return 70 * (drawer.pixelRatio * 0.4) * scale / 2;
    }
}


export function getMarkerFromClientXy(iconType: IconType, x: number, y: number, drawer: Drawer) {
    const pxSvgMatrix = drawer.getPxSvgMatrix();
    const xys = m4.transformPoint(pxSvgMatrix, [x, y, 1], null);
    const xs = xys[0];
    const ys = xys[1];



    const result = store.routeStore.markers.find(marker => {
        const radius = getRadius(drawer, iconType);
        let layer = store.layerStore.findLayer(marker.z);

        if (!layer) {
            return isPointInCircle(xs, ys, marker.x, marker.y, radius);
        }

        return isPointInCircle(xs, ys, marker.x, marker.y, radius) && layer && layer.visible;
    })

    return result;
}