import Color from "color";
import { reaction } from "mobx";
import { Line, lineLength, Point, pointIsOnLine } from "simple-geometry";
import Rectangle from "../../../../core/Rect";
import { getLayerSvg } from "../../../../data/svg";
import store, { layersStore, uiState } from "../../../../store";
import { LayersMode } from "../../../../store/LayerStore";
import logger from "../../../../tools/logger";
import { convertGpsToLocal, GpsConfig } from "../../../../utils/gps";
import { getGraphLines } from "../../../../utils/wayfinding";
import { fpGeo } from "../../../Mapbox/utils/fpGeo";
import { DrawerContext } from "../Drawer1";
import RectPainter from "../painters/RectPainter";
import { CurrentPosition } from "./../../../../store/RouteStore";
import { RouteLine } from "./../../../../utils/wayfinding";
import {
    createArrowCurrentCanvas,
    createCircleCanvas,
    createCurrentCanvas,
    createImageCanvas,
    createTargetCanvas,
    createYahCanvas,
} from "./canvases";
import { toRadians } from "../../../../utils/toRadians";
import { strEqual } from "../../../../utils/strEqual";
import { Booth } from "../../../../store/BoothStore";
import { KIOSK_ICON_HEIGHT, KIOSK_ICON_WIDTH } from "../../../../constants";
import { RouteCutIn } from "../../../../RouteCutIn";

let routePoints: Point[] = [];
let routeLines: RouteLine[] = [];

let pointSize: number = null;
let scale: number = null;

const totalPoints = 2000;
const isDebug = false;

const blinkCounter = 3;

let fromColor = Color("#00A2FF");
let toColor = Color("#FF9F06");
let pointColor = Color("#A4CCE3").hex();

let isNewVersion = false;

// const timeoutToChangeRoute = 15000; // 15 sec
// const distanceToChangeRoute = 200;

// let initialDate = null;

export function mapCurrentPosition(position: CurrentPosition): Point | null {
    var mapping = null;
    var fpConfig: GpsConfig = null;

    if (!fpConfig && fpGeo) {
        fpConfig = fpGeo.properties.config;
    }

    let point: Point;

    if (
        fpConfig &&
        position.x >= fpConfig.p0.x &&
        position.x <= fpConfig.p2.x &&
        position.y >= fpConfig.p0.y &&
        position.y <= fpConfig.p2.y
    ) {
        point = { ...position };
    } else if (fpConfig && position.lat && position.lng) {
        point = convertGpsToLocal(position.lat, position.lng, fpConfig);
    } else if (!fpConfig) {
        point = position;
    }

    if (!point) {
        logger.warn("Current position too far");
        return null;
    }

    var shift: { x: number; y: number } =
        mapping && position?.z && mapping[position.z.toString()] ? mapping[position.z.toString()] : null;

    if (!shift) return point;

    var cp = { ...point };
    cp.x += shift.x;
    cp.y += shift.y;

    return cp;
}

let blinkFrameId: number | null = null;
function blink(context: DrawerContext, painter: RectPainter, startIndex = routePoints.length - 1) {
    if (blinkFrameId !== null) cancelAnimationFrame(blinkFrameId);

    context.requireUpdate(() => {
        for (let i = 0; i < blinkCounter; i++) {
            const id = `Blink_${i}`;
            painter.updateVisible(id, false);
            painter.updateSkipdim(id, false);
        }
    });

    if (!routePoints.length) return;

    const cyclesPerSecond = 1 / 4;
    const speed = Math.max(1000 / (routePoints.length * cyclesPerSecond), 100);

    let index = startIndex;
    let lastUpdate = performance.now();

    const updatePoints = () => {
        for (let i = 0; i < blinkCounter; i++) {
            const pointIndex = (index - i + routePoints.length) % routePoints.length;
            const point = routePoints[pointIndex];
            const id = `Blink_${i}`;
            if (point) {
                painter.updateCenter(id, [point.x, point.y]);
                painter.updateVisible(id, true);
                painter.updateSkipdim(id, true);
            }
        }
    };

    const animate = (timestamp: number) => {
        const delta = timestamp - lastUpdate;

        if (delta >= speed) {
            lastUpdate = timestamp;
            index = (index - 1 + routePoints.length) % routePoints.length;
            context.requireUpdate(updatePoints);
        }

        blinkFrameId = requestAnimationFrame(animate);
    };

    blinkFrameId = requestAnimationFrame(animate);
}

function drawLines(
    wfDrawer: RectPainter,
    pointDrawer: RectPainter,
    transitionDrawer: RectPainter,
    trailDrawer: RectPainter,
    transitionsCollector: IDynamicObjects,
    trailPointsCollector: IDynamicObjects,
    ptscale: number,
    pixelRatio: number,
): Rectangle {
    routePoints.forEach((rp, i) => pointDrawer.updateVisible(`Dot_${i}`, false));
    transitionsCollector.clear();
    trailPointsCollector.clear();

    routePoints = [];

    const totalLength = routeLines.map((rl) => lineLength(rl.p0, rl.p1)).reduce((a, b) => a + b, 0);

    let interval = Math.round(pointSize * 1.2 * ptscale);
    if (totalLength > totalPoints * interval) interval = 1.1 * (totalLength / totalPoints);

    let lines = [];
    for (let i = 0; i < routeLines.length; i++) {
        let line = routeLines[i];

        let visible =
            store.layerStore.mode == LayersMode.Default
                ? true
                : store.layerStore.layers.find(
                      (l) =>
                          l.name == store.routeStore.currentRouteLayer?.name &&
                          store.routeStore.currentRouteLayer?.name === line.p0.layer
                  )?.visible || false;

        //let visible = store.layerStore.layers.find((l) => l.name === line.p0.layer)?.visible ?? true;

        if (!line.virtual && visible) lines.push(line);

        if ((line.virtual || !visible || i === routeLines.length - 1) && lines.length) {
            routePoints.push(...splitPolyLine(lines, interval));
            lines = [];
        }
    }

    if (store.uiState.kioskSetupData) {
        const routeCutIn = store.boothStore.booths.find(b => b instanceof RouteCutIn) as RouteCutIn;
        const cutInPoint = routeCutIn?.routePoint;
        if (cutInPoint) {
            routePoints = trimPointsToCutIn(cutInPoint, routePoints);
        }
    }

    routePoints.forEach((point, i) => {
        pointDrawer.updateCenter(`Dot_${i}`, [point.x, point.y]);
        pointDrawer.updateVisible(`Dot_${i}`, true);
        pointDrawer.updateSkipdim(`Dot_${i}`, true);
    });

    if (routePoints.length) {
        const { from, to } = uiState.selectedRoute || {};
        const currentLayerName = store.routeStore.currentRouteLayer?.name;

        attachEndpoints(wfDrawer, routePoints, from, to, currentLayerName);

        attachTransitions(
            transitionDrawer,
            transitionsCollector,
            routeLines,
            store.layerStore.floors.map(f => f.name),
            currentLayerName,
            uiState.getRouteNextFloor,
            pixelRatio,
        );

        if (store.uiState.kioskSetupData) {
            const routeCutIn = store.boothStore.booths.find(b => b instanceof RouteCutIn) as RouteCutIn;
            if (routeCutIn) {
                const departurePoint = routePoints[routePoints.length - 1];
                attachTrailPoints(
                    trailDrawer,
                    pixelRatio,
                    ptscale,
                    pointSize,
                    Color("#b5b7bc").hex(),
                    departurePoint,
                    routeCutIn.destination,
                    trailPointsCollector,
                );
            }
        }
    } else {
        wfDrawer.updateVisible("destinationLocation", false);
        wfDrawer.updateVisible("sourceLocation", false);
    }

    var x1 = 1000000;
    var y1 = 1000000;

    var x2 = 0;
    var y2 = 0;

    routePoints.forEach((l) => {
        if (l.x < x1) x1 = l.x;
        if (l.y < y1) y1 = l.y;

        if (l.x > x2) x2 = l.x;
        if (l.y > y2) y2 = l.y;
    });

    var rect = Rectangle.fromX1y1x2y2(x1, y1, x2, y2);

    return routePoints.length && (rect.w || rect.h) ? rect.withPadding(rect.w, rect.h) : null;
}

export function splitPolyLine(lines: Line[], interval: number): Point[] {
    if (lines.length === 0) {
        return [];
    }

    const points: Point[] = [];
    let offset = 0;

    for (let i = 0; i < lines.length; i++) {
        const currentLine = lines[i];
        const p0 = currentLine.p0;
        const p1 = currentLine.p1;

        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;
        const segLength = Math.sqrt(dx * dx + dy * dy);

        if (segLength === 0) {
            // Skip zero-length segments
            continue;
        }

        const dirX = dx / segLength;
        const dirY = dy / segLength;

        let step = 0;
        while (offset + step * interval <= segLength) {
            const distance = offset + step * interval;
            const newX = p0.x + dirX * distance;
            const newY = p0.y + dirY * distance;
            points.push({ x: newX, y: newY });
            step++;
        }

        const lastPlacedDistance = offset + (step - 1) * interval;
        let remaining = segLength - lastPlacedDistance;
        remaining = Math.max(remaining, 0);

        if (i < lines.length - 1) {
            const nextLine = lines[i + 1];
            const nextP0 = nextLine.p0;
            const nextP1 = nextLine.p1;
            const nextDx = nextP1.x - nextP0.x;
            const nextDy = nextP1.y - nextP0.y;
            const nextSegLength = Math.sqrt(nextDx * nextDx + nextDy * nextDy);

            if (nextSegLength === 0) {
                offset = 0;
            } else {
                const nextDirX = nextDx / nextSegLength;
                const nextDirY = nextDy / nextSegLength;
                const cosTheta = dirX * nextDirX + dirY * nextDirY;
                const effectiveRemaining = remaining * cosTheta;
                offset = interval - effectiveRemaining;
            }
        } else {
            offset = interval - remaining;
        }

        offset = Math.max(offset, 0);
    }

    // Ensure the first point is the start of the polyline
    const firstPoint = lines[0].p0;
    if (points.length === 0 || !points[0] || points[0].x !== firstPoint.x || points[0].y !== firstPoint.y) {
        points.unshift(firstPoint);
    }

    // Ensure the last point is the end of the polyline
    const lastPoint = lines[lines.length - 1].p1;
    const lastPointInArray = points[points.length - 1];
    if (points.length === 0 || !lastPointInArray || lastPointInArray.x !== lastPoint.x || lastPointInArray.y !== lastPoint.y) {
        points.push(lastPoint);
    }

    return points;
}

export default function configWf(context: DrawerContext, painterOrderPriority: number, visible: boolean) {
    //if (data.hideDirections) return;

    const pointDrawer = context.requirePainter("POINT", RectPainter, painterOrderPriority, visible);
    const blinkDrawer = context.requirePainter("BLINK", RectPainter, painterOrderPriority + 1, visible);
    const wfDrawer = context.requirePainter("WF", RectPainter, painterOrderPriority + 2, visible);
    const transitionDrawer = context.requirePainter("TRANSITION", RectPainter, painterOrderPriority + 2, visible);
    const transitionsCollector = new DynamicObjects(transitionDrawer);

    const trailDrawer = context.requirePainter("TRAIL", RectPainter, painterOrderPriority, visible);
    const trailPointsCollector = new DynamicObjects(trailDrawer);

    const kioskIconDrawer = context.requirePainter("KIOSK_ICON", RectPainter, painterOrderPriority + 3, visible);

    const pointCanvas = createCircleCanvas(6, context.pixelRatio, pointColor);

    const blinkCanvas = createCircleCanvas(6, context.pixelRatio, fromColor.hex());

    let sourceLocationCanvas;
    if (store.fp.icons.get("departure")) {
        sourceLocationCanvas = createImageCanvas(store.fp.icons.get("departure"), 34, 34, context.pixelRatio);
    } else {
        sourceLocationCanvas = createCurrentCanvas(context.pixelRatio, fromColor.hex());
    }

    let destinationLocationCanvas;
    if (store.fp.icons.get("destination")) {
        destinationLocationCanvas = createImageCanvas(store.fp.icons.get("destination"), 34, 34, context.pixelRatio);
    } else {
        destinationLocationCanvas = createTargetCanvas(context.pixelRatio, toColor.hex());
    }

    const currentLocationCanvas = createCurrentCanvas(context.pixelRatio, fromColor.hex());

    let arrowCurrentCanvas;
    if (store.fp.icons.get("direction")) {
        arrowCurrentCanvas = createImageCanvas(store.fp.icons.get("direction"), 34, 34, context.pixelRatio);
    } else {
        arrowCurrentCanvas = createArrowCurrentCanvas(context.pixelRatio, fromColor.hex());
    }

    const currentLocationCanvas_2 = createYahCanvas(context.pixelRatio);

    const l = getLayerSvg();
    isNewVersion = l.getAttribute("fp-ver")?.startsWith("5") ?? false;

    pointSize = pointCanvas.width;

    for (let i = 0; i < totalPoints; i++) {
        pointDrawer.addObject({
            id: `Dot_${i.toString()}`,
            center: [0, 0],
            deltaPts: [-pointCanvas.width / 2, -pointCanvas.width / 2, pointCanvas.width, pointCanvas.width],
            canvasTmp: pointCanvas,
            texPosition: "lefttop",
            visible: isDebug,
        });
    }

    for (let i = 0; i < blinkCounter; i++) {
        blinkDrawer.addObject({
            id: `Blink_${i.toString()}`,
            center: [0, 0],
            deltaPts: [-blinkCanvas.width / 2, -blinkCanvas.width / 2, blinkCanvas.width / 2, blinkCanvas.width / 2],
            canvasTmp: blinkCanvas,
            texPosition: "lefttop",
            visible: isDebug,
        });
    }

    wfDrawer.addObject({
        id: "sourceLocation",
        center: [0, 0],
        deltas: [0, 0, 0, 0],
        deltaPts: [
            -sourceLocationCanvas.width / 2,
            -sourceLocationCanvas.height / 2,
            sourceLocationCanvas.width,
            sourceLocationCanvas.height,
        ],
        canvasTmp: sourceLocationCanvas,
        texPosition: "lefttop",
        visible: isDebug,
    });

    wfDrawer.addObject({
        id: "destinationLocation",
        center: [0, 0],
        deltas: [0, 0, 0, 0],
        deltaPts: [
            -destinationLocationCanvas.width / 2,
            -destinationLocationCanvas.height / 2,
            destinationLocationCanvas.width,
            destinationLocationCanvas.height,
        ],
        canvasTmp: destinationLocationCanvas,
        texPosition: "lefttop",
        visible: isDebug,
    });

    const currentLocationPad = 5 * context.pixelRatio;

    wfDrawer.addObject({
        id: "currentLocation",
        center: [0, 0],
        deltas: [0, 0, 0, 0],
        deltaPts: [
            -currentLocationCanvas.width / 2 + currentLocationPad,
            -currentLocationCanvas.height / 2 + currentLocationPad,
            currentLocationCanvas.width,
            currentLocationCanvas.height,
        ],
        canvasTmp: currentLocationCanvas,
        texPosition: "lefttop",
        visible: isDebug,
    });

    wfDrawer.addObject({
        id: "currentLocation_arrow",
        center: [0, 0],
        deltas: [0, 0, 0, 0],
        deltaPts: [
            -arrowCurrentCanvas.width / 2 + currentLocationPad,
            -arrowCurrentCanvas.height / 2 + currentLocationPad,
            arrowCurrentCanvas.width,
            arrowCurrentCanvas.height,
        ],
        canvasTmp: arrowCurrentCanvas,
        texPosition: "lefttop",
        visible: isDebug,
    });

    wfDrawer.addObject({
        id: "currentLocation_2",
        center: [0, 0],
        deltas: [0, 0, 0, 0],
        deltaPts: [
            -currentLocationCanvas_2.width / 2,
            -currentLocationCanvas_2.height,
            currentLocationCanvas_2.width,
            currentLocationCanvas_2.height,
        ],
        canvasTmp: currentLocationCanvas_2,
        texPosition: "lefttop",
        visible: isDebug,
    });

    let kioskIconCanvas;
    if (store.fp.icons.get("kiosk")) {
        kioskIconCanvas = createImageCanvas(store.fp.icons.get("kiosk"), KIOSK_ICON_WIDTH, KIOSK_ICON_HEIGHT, context.pixelRatio);
    } else {
        kioskIconCanvas = createCurrentCanvas(context.pixelRatio, fromColor.hex());
    }
    kioskIconDrawer.addObject({
        id: "kioskIcon",
        center: [0, 0],
        deltas: [0, 0, 0, 0],
        deltaPts: [
            -kioskIconCanvas.width / 2,
            -kioskIconCanvas.height,
            kioskIconCanvas.width,
            kioskIconCanvas.height,
        ],
        canvasTmp: kioskIconCanvas,
        texPosition: "lefttop",
        visible: true,
    });

    reaction(
        () => ({
            kioskSetupData: store.uiState.kioskSetupData,
            floors: store.layerStore.floors,
        }),
        ({ kioskSetupData, floors }) => {
            const activeFloor = floors.find(f => f.active);

            context.requireUpdate(() => {
                if (kioskSetupData && kioskSetupData.z === activeFloor?.name) {
                    kioskIconDrawer.updateSkipdim("kioskIcon", true);
                    kioskIconDrawer.updateCenter("kioskIcon", [kioskSetupData.x, kioskSetupData.y]);
                    kioskIconDrawer.updateVisible("kioskIcon", true);
                } else {
                    kioskIconDrawer.updateVisible("kioskIcon", false);
                }
            });
        }
    );

    wfDrawer.updateSkipdim("sourceLocation", true);
    wfDrawer.updateSkipdim("destinationLocation", true);
    wfDrawer.updateSkipdim("currentLocation", false);
    wfDrawer.updateSkipdim("currentLocation_arrow", false);
    wfDrawer.updateSkipdim("currentLocation_2", false);

    function updateRoute(currentRouteLayer: Layer = null) {
        var layers = store.layerStore.visible.map((l) => l.name);

        for (let i = 0; i < routePoints.length; i++) pointDrawer.updateVisible(`Dot_${i}`, false);
        transitionsCollector.clear();
        trailPointsCollector.clear();
        wfDrawer.updateVisible("sourceLocation", false);
        wfDrawer.updateVisible("destinationLocation", false);

        routePoints = [];

        if (!currentRouteLayer) routeLines = [];

        if (layers.length && uiState.selectedRoute?.from?.rect && uiState.selectedRoute?.to?.rect) {
            let from = uiState.selectedRoute.from;
            let to = uiState.selectedRoute.to;


            if (!routeLines.length && !currentRouteLayer) routeLines = getGraphLines(from, to, store.routeStore.onlyAccessible, uiState.selectedRoute.waypoints);

            if (!routeLines.length) {
                store.routeStore.updateRoutePoints(routeLines);
                if (from.name !== to.name) throw new Error(`Route not found. From: ${from.name} to: ${to.name}`);
                return;
            }

            var rect = drawLines(
                wfDrawer,
                pointDrawer,
                transitionDrawer,
                trailDrawer,
                transitionsCollector,
                trailPointsCollector,
                scale || 3,
                context.pixelRatio,
            );
            if (rect) uiState.moveToRect = rect;
        } else {
            wfDrawer.updateVisible("sourceLocation", false);
            wfDrawer.updateVisible("destinationLocation", false);
        }

        store.routeStore.updateRoutePoints(routeLines.filter((gl) => !gl.virtual));
    }

    function updateCurrentPosition(): number {
        const position = store.routeStore.currentPosition;

        if (position) {
            const visible = layersStore.findLayer(position.z)?.visible ?? true;

            wfDrawer.updateVisible("sourceLocation", false);

            if (store.routeStore.iconType === 0 || (uiState.selectedRoute?.from && uiState.selectedRoute?.to)) {
                wfDrawer.updateVisible("currentLocation_2", false);

                wfDrawer.updateVisible("currentLocation", visible);
                wfDrawer.updateSkipdim("currentLocation", visible);
                wfDrawer.updateCenter("currentLocation", [position.x, position.y]);

                const rotateRadians = position?.angle ? toRadians(position.angle) : null;

                if (rotateRadians !== undefined && rotateRadians !== null) {
                    wfDrawer.updateVisible("currentLocation", false);
                    wfDrawer.updateVisible("currentLocation_arrow", visible);
                    wfDrawer.updateSkipdim("currentLocation_arrow", visible);
                    wfDrawer.updateCenter("currentLocation_arrow", [position.x, position.y]);
                    wfDrawer.updateRotation("currentLocation_arrow", rotateRadians);
                } else {
                    wfDrawer.updateVisible("currentLocation_arrow", false);
                }
            } else {
                wfDrawer.updateVisible("currentLocation", false);
                wfDrawer.updateVisible("currentLocation_arrow", false);

                wfDrawer.updateSkipdim("currentLocation_2", visible);
                wfDrawer.updateVisible("currentLocation_2", visible);
                wfDrawer.updateCenter("currentLocation_2", [position.x, position.y]);
            }
        } else {
            wfDrawer.updateVisible("currentLocation", false);
            wfDrawer.updateVisible("currentLocation_arrow", false);
            wfDrawer.updateVisible("currentLocation_2", false);
        }

        if (!position || !routePoints.length) return 0;

        const shortestrPerp = routePoints
            .map((p, i) => {
                return {
                    i,
                    p,
                    l: lineLength(position, p),
                };
            })
            .sort((p1, p2) => p1.l - p2.l)[0];

        if (!shortestrPerp || shortestrPerp.l > 150) return 0;

        // Recalculate logic here

        // if (shortestrPerp.l > distanceToChangeRoute) {
        //     if (!initialDate) initialDate = new Date();
        //     else {
        //         const diff = new Date().valueOf() - initialDate.valueOf();

        //         if (diff >= timeoutToChangeRoute) {
        //             const newBooth = getNearestBooth(position);
        //             if (newBooth)
        //                 store.routeStore.selectRoute(
        //                     new Route(newBooth, uiState.selectedRoute.to, uiState.selectedRoute.onlyAccessible)
        //                 );
        //         }
        //     }
        // } else {
        //     initialDate = null;
        // }

        // Recalculate logic here

        for (let index = routePoints.length - 1; index > shortestrPerp.i - 1; index--)
            pointDrawer.updateVisible(`Dot_${index}`, false);

        var lines = [];
        for (let index = 0; index < routeLines.length; index++) {
            const line = routeLines[index];
            if (shortestrPerp.l < 200 && pointIsOnLine(shortestrPerp.p, line.p0, line.p1)) {
                lines.push({ p0: line.p0, p1: shortestrPerp.p });
                break;
            } else lines.push(line);
        }

        if (shortestrPerp.l < 200) {
            wfDrawer.updateCenter("currentLocation", [shortestrPerp.p.x, shortestrPerp.p.y]);
            wfDrawer.updateCenter("currentLocation_arrow", [shortestrPerp.p.x, shortestrPerp.p.y]);
        }

        store.routeStore.updateRoutePoints(lines.filter((gl) => !gl.virtual));

        return shortestrPerp.i;
    }

    if (context.updatable) {
        reaction(
            () => context.ptscale,
            () => {
                context.requireUpdate(() => {
                    let s = Math.max(
                        context.ptscale < 1 ? Math.round(context.ptscale * 10) / 10 : Math.round(context.ptscale),
                        isNewVersion ? 0.05 : 0.3
                    );
                    scale = s;

                    drawLines(
                        wfDrawer,
                        pointDrawer,
                        transitionDrawer,
                        trailDrawer,
                        transitionsCollector,
                        trailPointsCollector,
                        s,
                        context.pixelRatio,
                    );

                    blink(context, blinkDrawer, updateCurrentPosition());
                });
            }
        );

        reaction(
            () => [store.layerStore.layersLoaded],
            () => {
                context.requireUpdate(() => {
                    updateRoute();
                    blink(context, blinkDrawer, updateCurrentPosition());
                });
            }
        );

        reaction(
            () => [store.routeStore.currentRouteLayer],
            () => {
                if (!store.layerStore.layersLoaded) return;
                context.requireUpdate(() => setTimeout(() => {
                    updateRoute(store.routeStore.currentRouteLayer);
                    blink(context, blinkDrawer, updateCurrentPosition());
                }, 200));   
            }
        );

        reaction(
            () => [uiState.selectedRoute, store.routeStore.onlyAccessible],
            () => {
                context.requireUpdate(() => {
                    updateRoute();
                    blink(context, blinkDrawer, updateCurrentPosition());
                });
            }
        );

        reaction(
            () => store.routeStore.currentPosition,
            () => {
                context.requireUpdate(() => blink(context, blinkDrawer, updateCurrentPosition()));
            }
        );

        updateRoute();
        updateCurrentPosition();
    }
}

function attachTransitions(
    drawer: RectPainter,
    idCollector: IDynamicObjects,
    lines: RouteLine[],
    floorOrder: string[],
    currentLayerName: string,
    routeNextFloor: string,
    pixelRatio: number,
): Point[] {
    idCollector.clear();

    const findIndex = (names, target) => names.findIndex(name => strEqual(name, target));
    const currentIndex = findIndex(floorOrder, currentLayerName);
    const nextIndex = findIndex(floorOrder, routeNextFloor);

    const points = [];
    lines.filter(l => {
        if (currentLayerName) {
            return l.virtual && (strEqual(l.p0.layer, currentLayerName) || strEqual(l.p1.layer, currentLayerName));
        }
        return l.virtual;
    }).flatMap(l => {
        if (currentLayerName && strEqual(l.p0.layer, currentLayerName)) {
            return [l.p0];
        } else if (currentLayerName && strEqual(l.p1.layer, currentLayerName)) {
            return [l.p1];
        } else {
            return [l.p0, l.p1];
        }
    }).forEach((point, i) => {
        let trasitionCanvas = createCurrentCanvas(pixelRatio, fromColor.hex());

        if (store.fp.icons.get("transition")) {
            trasitionCanvas = createImageCanvas(store.fp.icons.get("transition"), 34, 34, pixelRatio);
        }

        if (routeNextFloor && !strEqual(point.layer, routeNextFloor)) {
            if (nextIndex > currentIndex && store.fp.icons.get("transition_up")) {
                trasitionCanvas = createImageCanvas(store.fp.icons.get("transition_down"), 56, 34, pixelRatio)
            } else if (nextIndex < currentIndex && store.fp.icons.get("transition_down")) {
                trasitionCanvas = createImageCanvas(store.fp.icons.get("transition_up"), 56, 34, pixelRatio)
            }
        }

        const id = `trasition_${i}`;
        drawer.addObject({
            id,
            center: [point.x, point.y],
            deltas: [0, 0, 0, 0],
            deltaPts: [
                -trasitionCanvas.width / 2,
                -trasitionCanvas.height / 2,
                trasitionCanvas.width,
                trasitionCanvas.height,
            ],
            canvasTmp: trasitionCanvas,
            texPosition: "lefttop",
            visible: true,
        });
        idCollector.add(id);
        drawer.updateSkipdim(id, true);
        points.push(point);
    });
    drawer.reinitializeBuffers();

    return points;
}

interface IDynamicObjects {
    add: (id: string) => void;
    clear: () => void;
}
class DynamicObjects<T extends { removeObject: (id: string) => void }> implements IDynamicObjects {
    private ids = new Set<string>();

    constructor(private drawer: T) { }

    public add = (id: string) => {
        this.ids.add(id);
    }

    public clear = () => {
        this.ids.forEach(id => this.drawer.removeObject(id));
        this.ids.clear();
    }
}

function attachEndpoints(
    drawer: RectPainter,
    points: Point[],
    from: Booth,
    to: Booth,
    currentLayerName: string,
) {
    if (!points.length) return;

    const isFromLayer = !currentLayerName ? true : strEqual(currentLayerName, from?.layer?.name);
    const isToLayer = !currentLayerName ? true : strEqual(currentLayerName, to?.layer?.name);

    // TODO: Need to test this logic

    // const locations = [
    //     { key: "sourceLocation", rect: from?.rect },
    //     { key: "destinationLocation", rect: to?.rect },
    // ];

    // let sourceLocationAdded = false;
    // let destinationLocationAdded = false;

    // points.forEach(({ x, y }) => {
    //     for (const { key, rect } of locations) {
    //         if (rect?.containsPoint(x, y)) {
    //             drawer.updateCenter(key, [x, y]);

    //             if (key === "sourceLocation") {
    //                 drawer.updateVisible(key, isFromLayer);
    //                 sourceLocationAdded = isFromLayer;

    //             }

    //             if (key === "destinationLocation") {
    //                 drawer.updateVisible(key, isToLayer);
    //                 destinationLocationAdded = isToLayer;
    //             }

    //             break;
    //         }
    //     }
    // });

    // if (!sourceLocationAdded) {
        drawer.updateCenter("sourceLocation", [points[points.length - 1].x, points[points.length - 1].y]);
        drawer.updateVisible("sourceLocation", isFromLayer);
    // }

    // if (!destinationLocationAdded) {
        drawer.updateCenter("destinationLocation", [points[0].x, points[0].y]);
        drawer.updateVisible("destinationLocation", isToLayer);
    // }
}

function attachTrailPoints(
    drawer: RectPainter,
    pixelRatio: number,
    ptscale: number,
    pointSize: number,
    color: string,
    fromPoint: Point,
    toPoint: Point,
    idCollector: IDynamicObjects,
) {
    const size = 4;
    const points = splitPolyLine([{ p0: fromPoint, p1: toPoint }], Math.max(pointSize * 2 * ptscale, pointSize));

    if (points.length < 2) return;

    const dx = toPoint.x - fromPoint.x;
    const dy = toPoint.y - fromPoint.y;
    const distance = Math.hypot(dx, dy);

    const midPoint = {
        x: (fromPoint.x + toPoint.x) / 2,
        y: (fromPoint.y + toPoint.y) / 2 - distance * 0.2,
    };

    const allPoints = [fromPoint, midPoint, toPoint];
    const trailCanvas = createCircleCanvas(size, pixelRatio, color);

    points.forEach((_, i, arr) => {
        const t = (i + 1) / (arr.length + 1);
        const p = bezierCurve(allPoints, t);

        const id = `trail_${i}`;
        drawer.addObject({
            id,
            center: [p.x, p.y],
            deltas: [0, 0, 0, 0],
            deltaPts: [-trailCanvas.width / 2, -trailCanvas.height / 2, trailCanvas.width, trailCanvas.height],
            canvasTmp: trailCanvas,
            texPosition: "lefttop",
            visible: true,
        });

        idCollector.add(id);
        drawer.updateSkipdim(id, true);
    });

    drawer.reinitializeBuffers();
}

function bezierCurve(points: Point[], t: number): Point {
    if (points.length === 1) {
        return points[0];
    }

    const newPoints: Point[] = [];
    for (let i = 0; i < points.length - 1; i++) {
        const x = (1 - t) * points[i].x + t * points[i + 1].x;
        const y = (1 - t) * points[i].y + t * points[i + 1].y;
        newPoints.push({ x, y });
    }

    return bezierCurve(newPoints, t);
}

function trimPointsToCutIn(cutInPoint: Point, points: Point[]) {
    if (!cutInPoint || !points.length) {
        return points;
    }

    const closestIndex = points.reduce(
        (minIndex, p, i) => (lineLength(cutInPoint, p) < lineLength(cutInPoint, points[minIndex]) ? i : minIndex),
        0
    );

    return points.slice(0, closestIndex);
}