import Color from "color";
import { reaction } from "mobx";
import { Line, lineAngle, lineCenter, lineLength, Point, pointIsOnLine, Rect, shiftPoint } from "simple-geometry";
import Polygon4 from "../../../../core/Polygon";
import Rectangle from "../../../../core/Rect";
import data from "../../../../data";
import store, { uiState } from "../../../../store";
import { Booth } from "../../../../store/BoothStore";
import settings from "../../../../tools/settings";
import { convertGpsToLocal } from "../../../../utils/gps";
import { getGraphLines } from "../../../../utils/wayfinding";
import { DrawerContext } from "../Drawer1";
import RectPainter from "../painters/RectPainter";
import { boothStore } from "./../../../../store/index";
import { CurrentPosition, Route } from "./../../../../store/RouteStore";
import { RouteLine } from "./../../../../utils/wayfinding";
import { createCircleCanvas, createCurrentCanvas, createTargetCanvas } from "./canvases";

let routePoints: Point[] = [];
let routeLines: RouteLine[] = [];
let pointSize: number = null;
let scale: number = null;

const totalPoints = 700;
const isDebug = false;

let fromColor = Color("#30AFEB");
let toColor = Color("#FF9E2C");

const timeoutToChangeRoute = 15000; // 15 sec
const distanceToChangeRoute = 200;

let initialDate = null;

export function mapCurrentPosition(position: CurrentPosition): Point {
    var mapping = null;
    var fpConfig = null;

    if (settings.EXPO === "all-energy") {
        mapping = { "1": { x: 2399, y: 1998 }, "2": { x: 2000, y: 3300 } };
    }

    if (settings.EXPO.indexOf("cannes") > -1) {
        mapping = {
            "-1": { x: 10460, y: 12534 },
            "0": { x: 10511, y: 9568 },
            "1": { x: 10480, y: 7625 },
            "3": { x: 10480, y: 5094 },
            "4": { x: 10460, y: 3360 },
        };

        fpConfig = {
            p0: { lat: 43.55353615016951, lng: 7.013889203828078, x: 8689, y: 13886 },
            p1: { lat: 43.54734764989136, lng: 7.016619938071303, x: 14167, y: 17840 },
        };
    }

    let point: Point =
        fpConfig && position.lat && position.lng ? convertGpsToLocal(position.lat, position.lng, fpConfig) : position;

    var shift: { x: number; y: number } =
        mapping && position?.z && mapping[position.z.toString()] ? mapping[position.z.toString()] : null;

    if (!shift) return point;

    var cp = { ...point };
    cp.x += shift.x;
    cp.y += shift.y;

    return cp;
}

function getNearestBooth(point: Point): Booth {
    var booth = null;

    const booths = boothStore.booths.map((b) => {
        const lineCenterBooth = lineCenter(point, { x: b.rect.cx, y: b.rect.cy });
        return {
            lineLength: lineLength(point, lineCenterBooth),
            name: b.name,
        };
    });

    const nearest = booths.sort((b1, b2) => b1.lineLength - b2.lineLength)[0];

    booth = boothStore.booths.find((b) => b.name === nearest.name);

    return booth;
}

function drawLines(wfDrawer: RectPainter, ptscale: number) {
    routePoints.forEach((rp, i) => wfDrawer.updateVisible(`Dot_${i}`, false));

    routePoints = [];

    const totalLength = routeLines.map((rl) => lineLength(rl.p0, rl.p1)).reduce((a, b) => a + b, 0);

    let interval = Math.round(pointSize * 1.2 * ptscale);
    if (totalLength > totalPoints * interval) interval = 1.1 * (totalLength / totalPoints);

    let lines = [];
    for (let i = 0; i < routeLines.length; i++) {
        let line = routeLines[i];

        if (!line.virtual) lines.push(line);

        if ((line.virtual && lines.length) || i === routeLines.length - 1) {
            routePoints.push(...splitPolyLine(lines, interval));
            lines = [];
        }
    }

    routePoints.forEach((point, i) => {
        wfDrawer.updateCenter(`Dot_${i}`, [point.x, point.y]);
        wfDrawer.updateVisible(`Dot_${i}`, true);
        wfDrawer.updateSkipdim(`Dot_${i}`, true);
    });
}

function splitPolyLine(lines: Line[], interval: number): Point[] {
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

export default function configWf(context: DrawerContext, painterOrderPriority: number) {
    if (data.hideDirections) return;

    const wfDrawer = context.requirePainter("WF", RectPainter, painterOrderPriority);

    const pointCanvas = createCircleCanvas(6, context.pixelRatio, fromColor.hex());

    const sourceLocationCanvas = createCurrentCanvas(context.pixelRatio, fromColor.hex());
    const destinationLocationCanvas = createTargetCanvas(context.pixelRatio, toColor.hex());
    const currentLocationCanvas = createCurrentCanvas(context.pixelRatio, fromColor.hex());

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

    wfDrawer.addObject({
        id: "sourceLocation",
        center: [0, 0],
        deltas: [0, 0, 0, 0],
        deltaPts: [
            -currentLocationCanvas.width / 2,
            -currentLocationCanvas.height / 2,
            currentLocationCanvas.width,
            currentLocationCanvas.height,
        ],
        canvasTmp: currentLocationCanvas,
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

    wfDrawer.addObject({
        id: "currentLocation",
        center: [0, 0],
        deltas: [0, 0, 0, 0],
        deltaPts: [
            -sourceLocationCanvas.width / 2,
            -sourceLocationCanvas.height / 2,
            currentLocationCanvas.width,
            sourceLocationCanvas.height,
        ],
        canvasTmp: sourceLocationCanvas,
        texPosition: "lefttop",
        visible: isDebug,
    });

    wfDrawer.updateSkipdim("sourceLocation", true);
    wfDrawer.updateSkipdim("destinationLocation", true);

    wfDrawer.updateSkipdim("currentLocation", false);

    function updateRoute() {
        for (let i = 0; i < routePoints.length; i++) wfDrawer.updateVisible(`Dot_${i}`, false);

        routeLines = routePoints = [];

        if (uiState.selectedRoute?.from && uiState.selectedRoute?.to) {
            let from = uiState.selectedRoute.from;
            let to = uiState.selectedRoute.to;

            const p1 = Polygon4.fromRect(from.rect).rotate(from.rotate, from.rect.cx, from.rect.cy);
            const p2 = Polygon4.fromRect(to.rect).rotate(to.rotate, to.rect.cx, to.rect.cy);

            routeLines = getGraphLines(
                new Rect(new Point(p1.x1, p1.y1), new Point(p1.x2, p1.y2), new Point(p1.x3, p1.y3), new Point(p1.x4, p1.y4)),
                new Rect(new Point(p2.x1, p2.y1), new Point(p2.x2, p2.y2), new Point(p2.x3, p2.y3), new Point(p2.x4, p2.y4)),
                uiState.selectedRoute.exceptUnaccessible,
                false,
                false
            );

            if (routeLines.length === 0) {
                store.routeStore.updateRoutePoints(routeLines);
                if (from.name !== to.name) throw new Error(`Route not found. From: ${from.name} to: ${to.name}`);
                return;
            }

            drawLines(wfDrawer, scale || 3);

            wfDrawer.updateVisible("sourceLocation", true);
            wfDrawer.updateCenter("sourceLocation", [
                routeLines[routeLines.length - 1].p1.x,
                routeLines[routeLines.length - 1].p1.y,
            ]);

            wfDrawer.updateVisible("destinationLocation", true);
            wfDrawer.updateCenter("destinationLocation", [routeLines[0].p0.x, routeLines[0].p0.y]);

            let { x1, x2, y1, y2 } = Rectangle.fromMultiple([uiState.selectedRoute.from.rect, uiState.selectedRoute.to.rect]);
            routeLines.forEach((l) => {
                if (l.p0.x < x1) x1 = l.p0.x;
                if (l.p0.x > x2) x2 = l.p0.x;
                if (l.p0.y < y1) y1 = l.p0.y;
                if (l.p0.y > y2) y2 = l.p0.y;

                if (l.p1.x < x1) x1 = l.p1.x;
                if (l.p1.x > x2) x2 = l.p1.x;
                if (l.p1.y < y1) y1 = l.p1.y;
                if (l.p1.y > y2) y2 = l.p1.y;
            });

            uiState.moveToRect = Rectangle.fromX1y1x2y2(x1, y1, x2, y2);
        } else {
            wfDrawer.updateVisible("destinationLocation", false);
            wfDrawer.updateVisible("sourceLocation", false);
        }

        store.routeStore.updateRoutePoints(routeLines.filter((gl) => !gl.virtual));
    }

    function updateCurrentPosition() {
        let position = store.routeStore.currentPosition;

        if (position) {
            wfDrawer.updateVisible("sourceLocation", false);
            wfDrawer.updateSkipdim("currentLocation", true);
            wfDrawer.updateVisible("currentLocation", true);
            wfDrawer.updateCenter("currentLocation", [position.x, position.y]);
        } else {
            wfDrawer.updateVisible("currentLocation", false);
        }

        if (!position || !routePoints.length) return;

        const shortestrPerp = routePoints
            .map((p, i) => {
                return {
                    i,
                    p,
                    l: lineLength(position, p),
                };
            })
            .sort((p1, p2) => p1.l - p2.l)[0];

        if (!shortestrPerp) return;

        // Recalculate logic here

        // if (shortestrPerp.l > distanceToChangeRoute) {
        //     if (!initialDate) initialDate = new Date();
        //     else {
        //         const diff = new Date().valueOf() - initialDate.valueOf();

        //         if (diff >= timeoutToChangeRoute) {
        //             const newBooth = getNearestBooth(position);
        //             if (newBooth)
        //                 store.routeStore.selectRoute(
        //                     new Route(newBooth, uiState.selectedRoute.to, uiState.selectedRoute.exceptUnaccessible)
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
            if (pointIsOnLine(shortestrPerp.p, line.p0, line.p1)) {
                lines.push({ p0: line.p0, p1: shortestrPerp.p });
                break;
            } else lines.push(line);
        }

        if (shortestrPerp.l < 200) wfDrawer.updateCenter("currentLocation", [shortestrPerp.p.x, shortestrPerp.p.y]);

        store.routeStore.updateRoutePoints(lines.filter((gl) => !gl.virtual));
    }

    if (context.updatable) {
        reaction(
            () => context.ptscale,
            () => {
                let s = Math.max(context.ptscale < 1 ? Math.round(context.ptscale * 10) / 10 : Math.round(context.ptscale), 0.3);
                if (s === scale) return;
                scale = s;
                drawLines(wfDrawer, s);
                updateCurrentPosition();
            }
        );

        reaction(
            () => uiState.selectedRoute,
            () => context.requireUpdate(updateRoute)
        );

        reaction(
            () => store.routeStore.currentPosition,
            () => context.requireUpdate(updateCurrentPosition)
        );

        updateRoute();
        updateCurrentPosition();
    }
}
