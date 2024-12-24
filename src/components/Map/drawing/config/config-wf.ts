import Color from "color";
import { reaction } from "mobx";
import { Line, lineAngle, lineLength, Point, pointIsOnLine, shiftPoint } from "simple-geometry";
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
    createTargetCanvas,
    createYahCanvas,
} from "./canvases";

let routePoints: Point[] = [];
let routeLines: RouteLine[] = [];

let pointSize: number = null;
let scale: number = null;

const totalPoints = 700;
const isDebug = false;

const blinkCounter = 5;

let fromColor = Color("#30AFEB");
let toColor = Color("#FF9E2C");

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

let blinkCancellation = null;
let blinkTimeout = null;
let counter = 0;
function blink(context: DrawerContext, painter: RectPainter, startIndex: number = null) {
    if (blinkTimeout) clearTimeout(blinkTimeout);
    if (blinkCancellation) blinkCancellation();
    if (counter) {
        if (!routePoints.length) counter = 0;
        return;
    }

    blinkTimeout = setTimeout(() => {
        blinkTimeout = null;
        if (routePoints.length) blinkCancellation = blinkCircle(context, painter, startIndex);
    }, 1000);
}

let currentIndex: number;

function blinkCircle(context: DrawerContext, painter: RectPainter, startIndex: number): () => void {
    const updateBlink = (painter: RectPainter, visible: boolean) => {
        for (let i = 0; i < blinkCounter; i++) {
            painter.updateVisible(`Blink_${i.toString()}`, visible);
            painter.updateSkipdim(`Blink_${i.toString()}`, visible);
        }
    };

    const cIndex = () => startIndex || routePoints.length - 1;

    const st = () => {
        for (let i = 0; i < blinkCounter; i++) {
            const point = routePoints[currentIndex - i];
            if (point) painter.updateCenter(`Blink_${i.toString()}`, [point.x, point.y]);
        }

        if (currentIndex <= 0) {
            currentIndex = cIndex();
            counter++;
        }

        if (counter > 1) {
            clearInterval(blinkStepInterval);
            updateBlink(painter, false);
        }

        currentIndex--;
    };

    currentIndex = cIndex();

    const interval = 4000 / currentIndex;
    let blinkStepInterval = null;

    updateBlink(painter, true);
    blinkStepInterval = setInterval(() => context.requireUpdate(st), Math.min(40, interval));

    return () => {
        clearInterval(blinkStepInterval);
        context.requireUpdate(() => updateBlink(painter, false));
    };
}

function drawLines(wfDrawer: RectPainter, ptscale: number): Rectangle {
    routePoints.forEach((rp, i) => wfDrawer.updateVisible(`Dot_${i}`, false));

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

    routePoints.forEach((point, i) => {
        wfDrawer.updateCenter(`Dot_${i}`, [point.x, point.y]);
        wfDrawer.updateVisible(`Dot_${i}`, true);
        wfDrawer.updateSkipdim(`Dot_${i}`, true);
    });

    if (routePoints.length) {
        wfDrawer.updateVisible("sourceLocation", true);
        wfDrawer.updateCenter("sourceLocation", [routePoints[routePoints.length - 1].x, routePoints[routePoints.length - 1].y]);
        wfDrawer.updateVisible("destinationLocation", true);
        wfDrawer.updateCenter("destinationLocation", [routePoints[0].x, routePoints[0].y]);
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
    const sin = (deg: number) => Math.sin((deg * Math.PI) / 180);
    const asin = (sin: number) => (Math.asin(sin) * 180) / Math.PI;

    let basePoint: Point = lines[0].p0;

    const points: Point[] = [basePoint];

    let delta = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let lineLen = lineLength(line.p0, line.p1);
        let lineAng = Math.round(lineAngle(line.p0, line.p1));

        let steps = 0;
        while (delta + steps * interval <= lineLen) {
            let point = shiftPoint(line.p0, delta + steps * interval, lineAng);
            points.push(point);
            steps++;
        }

        const ostatok = lineLen - ((steps - 1) * interval + delta);

        if (i < lines.length - 1) {
            let nextAngle = Math.round(lineAngle(lines[i + 1].p0, lines[i + 1].p1));
            let alpha = 180 - Math.abs(lineAng - nextAngle);

            delta = (interval * sin(180 - alpha - asin((ostatok * sin(alpha)) / interval))) / sin(alpha);
        } else delta = interval - ostatok;
    }

    return points;
}

export default function configWf(context: DrawerContext, painterOrderPriority: number, visible: boolean) {
    //if (data.hideDirections) return;

    const wfDrawer = context.requirePainter("WF", RectPainter, painterOrderPriority, visible);
    const blinkDrawer = context.requirePainter("BLINK", RectPainter, painterOrderPriority + 1, visible);

    const pointCanvas = createCircleCanvas(6, context.pixelRatio, fromColor.hex());

    const blinkCanvas = createCircleCanvas(6, context.pixelRatio, Color("#c1e4f5").hex());

    const sourceLocationCanvas = createCurrentCanvas(context.pixelRatio, fromColor.hex());
    const destinationLocationCanvas = createTargetCanvas(context.pixelRatio, toColor.hex());
    const currentLocationCanvas = createCurrentCanvas(context.pixelRatio, fromColor.hex());
    const arrowCurrentCanvas = createArrowCurrentCanvas(context.pixelRatio, fromColor.hex());
    const currentLocationCanvas_2 = createYahCanvas(context.pixelRatio);

    const l = getLayerSvg();
    isNewVersion = l.getAttribute("fp-ver")?.startsWith("5") ?? false;

    pointSize = pointCanvas.width;

    for (let i = 0; i < totalPoints; i++) {
        wfDrawer.addObject({
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
            -destinationLocationCanvas.height,
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
        canvasTmp: sourceLocationCanvas,
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

    wfDrawer.updateSkipdim("sourceLocation", true);
    wfDrawer.updateSkipdim("destinationLocation", true);
    wfDrawer.updateSkipdim("currentLocation", false);
    wfDrawer.updateSkipdim("currentLocation_arrow", false);
    wfDrawer.updateSkipdim("currentLocation_2", false);

    function updateRoute(currentRouteLayer: Layer = null) {
        var layers = store.layerStore.visible.map((l) => l.name);

        for (let i = 0; i < routePoints.length; i++) wfDrawer.updateVisible(`Dot_${i}`, false);

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

            var rect = drawLines(wfDrawer, scale || 3);
            if (rect) uiState.moveToRect = rect;
        } else {
            wfDrawer.updateVisible("sourceLocation", false);
            wfDrawer.updateVisible("destinationLocation", false);
        }

        store.routeStore.updateRoutePoints(routeLines.filter((gl) => !gl.virtual));
    }

    function updateCurrentPosition(): number {
        let position = store.routeStore.currentPosition;

        if (position) {
            const visible = layersStore.findLayer(position.z)?.visible ?? true;
            wfDrawer.updateVisible("sourceLocation", false);

            if (store.routeStore.iconType === 0 || (uiState.selectedRoute?.from && uiState.selectedRoute?.to)) {
                wfDrawer.updateVisible("currentLocation_2", false);

                wfDrawer.updateVisible("currentLocation", visible);
                wfDrawer.updateSkipdim("currentLocation", visible);
                wfDrawer.updateCenter("currentLocation", [position.x, position.y]);

                const rotateRadians = (position?.angle * Math.PI) / 180 || null;

                if (rotateRadians !== undefined && rotateRadians !== null) {
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
            wfDrawer.updateVisible(`Dot_${index}`, false);

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
                let s = Math.max(
                    context.ptscale < 1 ? Math.round(context.ptscale * 10) / 10 : Math.round(context.ptscale),
                    isNewVersion ? 0.05 : 0.3
                );
                if (s === scale) return;
                scale = s;
                drawLines(wfDrawer, s);
                blink(context, blinkDrawer, updateCurrentPosition());
            }
        );

        reaction(
            () => [store.layerStore.layersLoaded],
            () => {
                counter = 0;
                context.requireUpdate(updateRoute);
                blink(context, blinkDrawer, updateCurrentPosition());
            }
        );

        reaction(
            () => [store.routeStore.currentRouteLayer],
            () => {
                if (!store.layerStore.layersLoaded) return;
                counter = 0;
                context.requireUpdate(() => setTimeout(() => updateRoute(store.routeStore.currentRouteLayer), 200));
                blink(context, blinkDrawer, updateCurrentPosition());
            }
        );

        reaction(
            () => [uiState.selectedRoute, store.routeStore.onlyAccessible],
            () => {
                context.requireUpdate(updateRoute);
                counter = 0;
                blink(context, blinkDrawer, updateCurrentPosition());
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
