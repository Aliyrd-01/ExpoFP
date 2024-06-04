import { DrawerContext } from "../Drawer1";
import RectPainter from "../painters/RectPainter";
import { createCurrentCanvas } from "./canvases";
import Color from "color";
import store, { layersStore } from "../../../../store";
import { reaction } from "mobx";

export function configMarkers(context: DrawerContext, painterOrderPriority: number, visible: boolean) {
    const markersDrawer = context.requirePainter("MARKERS", RectPainter, painterOrderPriority, visible);
    const markerCanvas = createCurrentCanvas(context.pixelRatio, Color("#30AFEB").hex());
    const selectedMarkerCanvas = createCurrentCanvas(context.pixelRatio, Color("#C4001F").hex());

    function drawMarkers() {
        if (!store.routeStore.markers.length) return;
        const markers = store.routeStore.markers;

        markers.forEach((marker, index) => {
            const id = `Marker_${marker.id}`;
            markersDrawer.addObject({
                id: id,
                center: [0, 0],
                deltas: [0, 0, 0, 0],
                deltaPts: [
                    -markerCanvas.width / 2,
                    -markerCanvas.height / 2,
                    markerCanvas.width,
                    markerCanvas.height,
                ],
                canvasTmp: markerCanvas,
                texPosition: "lefttop",
                visible: false,
            });

            markersDrawer.addObject({
                id: `${id}_selected`,
                center: [0, 0],
                deltas: [0, 0, 0, 0],
                deltaPts: [
                    -selectedMarkerCanvas.width / 2,
                    -selectedMarkerCanvas.height / 2,
                    selectedMarkerCanvas.width,
                    selectedMarkerCanvas.height,
                ],
                canvasTmp: selectedMarkerCanvas,
                texPosition: "lefttop",
                visible: false,
            });
        });
    }

    function updateMarkers() {
        if (!store.routeStore.markers.length) return;

        store.routeStore.markers.forEach((marker) => {
            const visible = layersStore.findLayer(marker.z)?.visible ?? true;

            console.error(marker, visible, layersStore.findLayer(marker.z)?.visible)

            if (marker.active) {
                markersDrawer.updateVisible(`Marker_${marker.id}_selected`, visible);
                markersDrawer.updateSkipdim(`Marker_${marker.id}_selected`, visible);
                markersDrawer.updateCenter(`Marker_${marker.id}_selected`, [marker.x, marker.y]);

                markersDrawer.updateVisible(`Marker_${marker.id}`, false);
                markersDrawer.updateSkipdim(`Marker_${marker.id}`, false);
            } else {
                markersDrawer.updateVisible(`Marker_${marker.id}_selected`, false);
                markersDrawer.updateSkipdim(`Marker_${marker.id}_selected`, false);

                markersDrawer.updateVisible(`Marker_${marker.id}`, visible);
                markersDrawer.updateSkipdim(`Marker_${marker.id}`, visible);
                markersDrawer.updateCenter(`Marker_${marker.id}`, [marker.x, marker.y]);
            }
        })

        markersDrawer.reinitializeBuffers();
    }

    if (context.updatable) {
        reaction(
            () => [store.routeStore.markers, store.routeStore.selectedMarkers, store.layerStore.loaded, store.layerStore.visible],
            () => {
                store.routeStore.prevMarkers.forEach(dot => {
                    markersDrawer.removeObject(`Marker_${dot.id}`);
                    markersDrawer.removeObject(`Marker_${dot.id}_selected`);
                });
                store.routeStore.prevMarkers = store.routeStore.markers;

                context.requireUpdate(drawMarkers);
                context.requireUpdate(updateMarkers);
            }
        );
    }
}