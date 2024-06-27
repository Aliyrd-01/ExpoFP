import { Drawer } from "./drawing/Drawer1";
import { m4 } from "twgl.js";
import store from "../../store";

export function getMarkerFromClientXy(x: number, y: number, drawer: Drawer) {
    const pxSvgMatrix = drawer.getPxSvgMatrix();
    const xys = m4.transformPoint(pxSvgMatrix, [x, y, 1], null);
    const xs = xys[0];
    const ys = xys[1];

    for (const marker of store.routeStore.markersData.markers) {
        const icon = store.routeStore.markersData.icons.find(icon => icon.name === marker.icon);
        if (!icon) continue;

        const iconWidth = icon.width * drawer.ptscale * drawer.pixelRatio; // Adjust for pixel ratio
        const iconHeight = icon.height * drawer.ptscale * drawer.pixelRatio; // Adjust for pixel ratio

        if (isPointInMarker(xs, ys, marker.x, marker.y, iconWidth, iconHeight)) {
            const layer = store.layerStore.findLayer(marker.z);
            if (!layer || (layer && layer.visible)) {
                return marker;
            }
        }
    }

    return null;
}

function isPointInMarker(x: number, y: number, markerX: number, markerY: number, iconWidth: number, iconHeight: number) {
    const halfWidth = iconWidth / 2;
    const halfHeight = iconHeight / 2;
    return x >= markerX - halfWidth && x <= markerX + halfWidth &&
        y >= markerY - halfHeight && y <= markerY + halfHeight;
}