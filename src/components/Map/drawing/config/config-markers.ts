import { DrawerContext } from "../Drawer1";
import RectPainter from "../painters/RectPainter";
import { CanvasDescriptor, createImageCanvas } from "./canvases";
import store, { layersStore } from "../../../../store";
import { reaction } from "mobx";
import { MarkerIcon } from "../../../../store/RouteStore";

export function configMarkers(context: DrawerContext, painterOrderPriority: number, visible: boolean) {
    const iconMap = new Map<string, { width: number, height: number, img: HTMLImageElement, scale: number }>();
    const canvasCache = new Map<string, CanvasDescriptor>();

    const markersDrawer = context.requirePainter("MARKERS", RectPainter, painterOrderPriority, visible);

    async function loadIcons(icons: MarkerIcon[]): Promise<void> {
        const promises: Promise<void>[] = [];

        icons.forEach(icon => {
            const { name, content, width, height, scale } = icon;
            if (iconMap.has(name)) return;

            const img = new Image();
            const promise = new Promise<void>((resolve, reject) => {
                img.onload = () => {
                    iconMap.set(name, { img, width, height, scale: scale ?? context.pixelRatio });
                    resolve();
                };
                img.onerror = (error) => {
                    reject(error);
                };
            });

            promises.push(promise);
            img.src = content;
            img.crossOrigin = "anonymous";
        });

        await Promise.all(promises);
    }

    function drawMarkers() {
        if (!store.routeStore.markersData.markers.length) return;
        const markers = store.routeStore.markersData.markers;

        markers.forEach((marker, index) => {
            const id = `Marker_${marker.id}`;
            const icon = iconMap.get(marker.icon);
            if (!icon) return;

            const cacheKey = `${marker.icon}_${icon.scale}`;
            if (!canvasCache.has(cacheKey)) {
                const imageCanvas = createImageCanvas(icon.img, icon.width, icon.height, icon.scale);
                canvasCache.set(cacheKey, imageCanvas);
            }
            const imageCanvas = canvasCache.get(cacheKey);

            if (marker.position === "centertop") {
                markersDrawer.addObject({
                    id,
                    center: [0, 0],
                    deltas: [0, 0, 0, 0],
                    deltaPts: [
                        -imageCanvas.width / 2,
                        -imageCanvas.height,
                        imageCanvas.width / 2,
                        0,
                    ],
                    texPosition: "centertop",
                    canvasTmp: imageCanvas,
                    visible: false,
                });
            } else if (marker.position === "lefttop") {
                markersDrawer.addObject({
                    id,
                    center: [0, 0],
                    deltas: [0, 0, 0, 0],
                    deltaPts: [
                        -imageCanvas.width / 2,
                        -imageCanvas.height / 2,
                        imageCanvas.width,
                        imageCanvas.height,
                    ],
                    canvasTmp: imageCanvas,
                    texPosition: "lefttop",
                    visible: false,
                });
            }

            const selectedIcon = iconMap.get(marker.selectedIcon);
            const selectedCacheKey = `${marker.selectedIcon}_${icon.scale}`;
            if (!canvasCache.has(selectedCacheKey)) {
                const selectedImageCanvas = createImageCanvas(selectedIcon.img, selectedIcon.width, selectedIcon.height, selectedIcon.scale);
                canvasCache.set(selectedCacheKey, selectedImageCanvas);
            }
            const selectedImageCanvas = canvasCache.get(selectedCacheKey);

            if (marker.position === "centertop") {
                markersDrawer.addObject({
                    id: `${id}_selected`,
                    center: [0, 0],
                    deltas: [0, 0, 0, 0],
                    deltaPts: [
                        -selectedImageCanvas.width / 2,
                        -selectedImageCanvas.height,
                        selectedImageCanvas.width / 2,
                        0,
                    ],
                    canvasTmp: selectedImageCanvas,
                    texPosition: "centertop",
                    visible: false,
                });
            } else if (marker.position === "lefttop") {
                markersDrawer.addObject({
                    id: `${id}_selected`,
                    center: [0, 0],
                    deltas: [0, 0, 0, 0],
                    deltaPts: [
                        -selectedImageCanvas.width / 2,
                        -selectedImageCanvas.height / 2,
                        selectedImageCanvas.width,
                        selectedImageCanvas.height,
                    ],
                    canvasTmp: selectedImageCanvas,
                    texPosition: "lefttop",
                    visible: false,
                });
            }
        });
    }

    function updateMarkers() {
        if (!store.routeStore.markersData.markers.length) return;

        store.routeStore.markersData.markers.forEach((marker) => {
            const visible = layersStore.findLayer(marker.z)?.visible ?? true;

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
            () => [store.routeStore.markersData, store.routeStore.selectedMarkers, store.layerStore.loaded, store.layerStore.visible],
            () => {
                loadIcons(store.routeStore.markersData.icons).then(() => {
                    store.routeStore.prevMarkers.forEach(dot => {
                        markersDrawer.removeObject(`Marker_${dot.id}`);
                        markersDrawer.removeObject(`Marker_${dot.id}_selected`);
                    });
                    store.routeStore.prevMarkers = store.routeStore.markersData.markers;

                    context.requireUpdate(drawMarkers);
                    context.requireUpdate(updateMarkers);
                })
            }
        );
    }
}