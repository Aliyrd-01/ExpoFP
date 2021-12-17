import Color from "color";
import { select } from "d3-selection";
import { reaction } from "mobx";
import Polygon4 from "../../../../core/Polygon";
import Rect from "../../../../core/Rect";
import svg from "../../../../data/svg";
import store, { boothStore, uiState } from "../../../../store";
import { buildGraph, getGraphLines, Line, lineAngle, lineLength, Point, Rectangle } from "../../../../utils/wayfinding";
import { DrawerContext } from "../Drawer1";
import RectPainter from "../painters/RectPainter";
import { RouteLine } from "./../../../../utils/wayfinding";
import { createCircleCanvas, createCurrentCanvas, createTargetCanvas } from "./canvases";

let routePoints: Point[] = [];
let routeLines: RouteLine[] = [];
let pointSize: number = null;
let scale: number = null;

const isDebug = false;

let fromColor = Color("#30AFEB");
let toColor = Color("#FF9E2C");

function parseDAttribute(d: string, unacc: boolean, uni: boolean, virt: boolean): RouteLine[] {
    return d
        .split(/[a-zA-Z]/g)
        .filter((p) => p.length)
        .map((part, i, array) => {
            let pp: string[];
            let p: string[];

            if (i === 0) {
                if (d.endsWith("Z")) {
                    pp = array[array.length - 1].split(",");
                    p = array[i].split(",");
                } else return null;
            } else {
                pp = array[i - 1].split(",");
                p = array[i].split(",");
            }

            return new RouteLine(
                new Point(parseFloat(pp[0]), parseFloat(pp[1])),
                new Point(parseFloat(p[0]), parseFloat(p[1])),
                unacc,
                uni,
                virt
            );
        })
        .filter((l) => l);
}

function perpendicularToLine(point: Point, start: Point, end: Point): { p: Point; isInside: boolean } {
    const k =
        ((end.y - start.y) * (point.x - start.x) - (end.x - start.x) * (point.y - start.y)) /
        (Math.pow(end.y - start.y, 2) + Math.pow(end.x - start.x, 2));

    let p = new Point(point.x - k * (end.y - start.y), point.y + k * (end.x - start.x));

    return {
        p,
        isInside:
            p.x >= Math.min(start.x, end.x) &&
            p.x <= Math.max(start.x, end.x) &&
            p.y >= Math.min(start.y, end.y) &&
            p.y <= Math.max(start.y, end.y),
    };
}

function shiftPoint(point: Point, length: number, angle: number): Point {
    return {
        x: point.x + length * Math.sin(((90 - angle) * Math.PI) / 180.0),
        y: point.y + length * Math.sin((angle * Math.PI) / 180.0),
    };
}

function drawLines(wfDrawer: RectPainter, ptscale: number) {
    routePoints.forEach((rp, i) => wfDrawer.updateVisible(`Dot_${i}`, false));

    routePoints = [];

    const interval = pointSize * 2 * ptscale;

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

const sin = (deg: number) => Math.sin((deg * Math.PI) / 180);
const asin = (sin: number) => (Math.asin(sin) * 180) / Math.PI;

function splitPolyLine(lines: Line[], interval: number): Point[] {
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
    const layer = select(svg).select<SVGAElement>("svg > [data-layer='WF']").node();

    const lines: RouteLine[] = [];

    (layer?.childNodes || []).forEach((node: any) => {
        const unacc = node.getAttribute("data-way-unaccessible") === "true" || false;
        const uni = node.getAttribute("data-way-unidirection") === "true" || false;
        const virt = node.getAttribute("data-way-virtual") === "true" || false;

        if (node.attributes.x1)
            lines.push(
                new RouteLine(
                    new Point(parseFloat(node.attributes.x1.value), parseFloat(node.attributes.y1.value)),
                    new Point(parseFloat(node.attributes.x2.value), parseFloat(node.attributes.y2.value)),
                    unacc,
                    uni,
                    virt
                )
            );
        else if (node.attributes.d) lines.push(...parseDAttribute(node.attributes.d.value, unacc, uni, virt));
    });

    const boothsRects = boothStore.booths.map((b) => {
        const p1 = Polygon4.fromRect(b.rect).rotate(b.rotate, b.rect.cx, b.rect.cy);
        return new Rectangle(new Point(p1.x1, p1.y1), new Point(p1.x2, p1.y2), new Point(p1.x3, p1.y3), new Point(p1.x4, p1.y4));
    });

    buildGraph(lines, boothsRects, [], 300);

    const wfDrawer = context.requirePainter("WF", RectPainter, painterOrderPriority);

    const pointCanvas = createCircleCanvas(6, context.pixelRatio, fromColor.hex());

    const sourceLocationCanvas = createCurrentCanvas(context.pixelRatio, fromColor.hex());
    const destinationLocationCanvas = createTargetCanvas(context.pixelRatio, toColor.hex());
    const currentLocationCanvas = createCurrentCanvas(context.pixelRatio, fromColor.hex());

    pointSize = pointCanvas.width;

    for (let i = 0; i < 300; i++) {
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
                new Rectangle(new Point(p1.x1, p1.y1), new Point(p1.x2, p1.y2), new Point(p1.x3, p1.y3), new Point(p1.x4, p1.y4)),
                new Rectangle(new Point(p2.x1, p2.y1), new Point(p2.x2, p2.y2), new Point(p2.x3, p2.y3), new Point(p2.x4, p2.y4)),
                uiState.selectedRoute.exceptUnaccessible
            );

            if (routeLines.length < 1) return store.routeStore.updateRoutePoints(routeLines);

            drawLines(wfDrawer, scale || 3);

            wfDrawer.updateVisible("sourceLocation", true);
            wfDrawer.updateCenter("sourceLocation", [
                routeLines[routeLines.length - 1].p1.x,
                routeLines[routeLines.length - 1].p1.y,
            ]);

            wfDrawer.updateVisible("destinationLocation", true);
            wfDrawer.updateCenter("destinationLocation", [routeLines[0].p0.x, routeLines[0].p0.y]);

            let { x1, x2, y1, y2 } = Rect.fromMultiple([uiState.selectedRoute.from.rect, uiState.selectedRoute.to.rect]);
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

            uiState.moveToRect = Rect.fromX1y1x2y2(x1, y1, x2, y2);
        } else {
            wfDrawer.updateVisible("destinationLocation", false);
            wfDrawer.updateVisible("sourceLocation", false);
        }

        store.routeStore.updateRoutePoints(routeLines.filter((gl) => !gl.virtual));
    }

    function updateCurrentPosition() {
        let position = store.routeStore.currentPosition;

        if (position) {
            wfDrawer.updateSkipdim("sourceLocation", false);
            wfDrawer.updateSkipdim("currentLocation", true);
            wfDrawer.updateVisible("currentLocation", true);

            wfDrawer.updateCenter("currentLocation", [position.x, position.y]);
        } else {
            wfDrawer.updateVisible("currentLocation", false);
            wfDrawer.updateSkipdim("sourceLocation", true);
        }

        const shortestrPerp = routePoints
            .map((p, i) => {
                if (i === 0) return null;
                let perp = perpendicularToLine(position, routePoints[i], routePoints[i - 1]);
                if (!perp.isInside) return null;

                return {
                    i,
                    p: perp.p,
                    angle: -1 * lineAngle(routePoints[i], routePoints[i - 1]),
                    l: lineLength(position, perp.p),
                };
            })
            .filter((p) => p)
            .sort((p1, p2) => p1.l - p2.l)[0];

        wfDrawer.updateCenter("currentLocation", [
            shortestrPerp?.p?.x || position?.x || 0,
            shortestrPerp?.p?.y || position?.y || 0,
        ]);

        if (!shortestrPerp || !routePoints.length) return;

        for (let index = routePoints.length - 1; index > shortestrPerp.i - 1; index--)
            wfDrawer.updateSkipdim(`Dot_${index}`, false);
    }

    if (context.updatable) {
        reaction(
            () => context.ptscale,
            () => {
                let s = Math.round(context.ptscale);
                if (s === scale || s % 4 === 0) return;
                if (s > 15) s = 15;
                scale = s;
                drawLines(wfDrawer, s);
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
