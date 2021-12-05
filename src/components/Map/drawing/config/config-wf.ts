import Color from "color";
import { select } from "d3-selection";
import { reaction } from "mobx";
import Polygon4 from "../../../../core/Polygon";
import Rect from "../../../../core/Rect";
import svg from "../../../../data/svg";
import store, { boothStore, uiState } from "../../../../store";
import { buildGraph, getGraphPoints, Line, lineAngle, lineLength, Point, Rectangle } from "../../../../utils/wayfinding";
import { DrawerContext } from "../Drawer1";
import RectPainter from "../painters/RectPainter";
import { createCircleCanvas, createCurrentCanvas, createTargetCanvas } from "./canvases";

let visibleRoutePoints: Point[] = [];
let maxVisibleIndex = 0;

const isDebug = false;

const pointsCount = 200;
const minInterval = (boothStore.borderWidth < 5 ? 5 : boothStore.borderWidth) * 15;

let colorFrom = Color("#30AFEB");
let colorTo = Color("#FF9E2C");

function parseDAttribute(d: string, unacc: boolean, uni: boolean, virt: boolean): Line[] {
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

            return new Line(
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

export default function configWf(context: DrawerContext, painterOrderPriority: number) {
    const layer = select(svg).select<SVGAElement>("svg > [data-layer='WF']").node();

    const lines: Line[] = [];

    (layer?.childNodes || []).forEach((node: any) => {
        const unacc = node.getAttribute("data-way-unaccessible") === "true" || false;
        const uni = node.getAttribute("data-way-unidirection") === "true" || false;
        const virt = node.getAttribute("data-way-virtual") === "true" || false;

        if (node.attributes.x1)
            lines.push(
                new Line(
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

    const dotsDrawer = context.requirePainter("WF_dots", RectPainter, painterOrderPriority);

    const locationsDrawer = context.requirePainter("wF_locations", RectPainter, painterOrderPriority + 1);
    const currentLocationCanvas = createCurrentCanvas(context.pixelRatio, colorFrom.hex());
    const destinationLocationCanvas = createTargetCanvas(context.pixelRatio, colorTo.hex());

    buildGraph(lines, boothsRects, [], 300);

    const dotCanvas = createCircleCanvas(minInterval / 12, context.pixelRatio, colorFrom.hex());

    for (let i = 0; i < pointsCount; i++) {
        dotsDrawer.addObject({
            id: `Dot_${i.toString()}`,
            center: [0, 0],
            deltaPts: [-dotCanvas.width / 2, -dotCanvas.width / 2, dotCanvas.width, dotCanvas.width],
            canvasTmp: dotCanvas,
            texPosition: "lefttop",
            visible: isDebug,
        });
    }

    locationsDrawer.addObject({
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

    locationsDrawer.addObject({
        id: "currentLocation",
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

    locationsDrawer.updateSkipdim("destinationLocation", true);
    locationsDrawer.updateSkipdim("currentLocation", true);

    function updateRoute() {
        for (let i = 0; i < maxVisibleIndex; i++) dotsDrawer.updateVisible(`Dot_${i}`, false);
        maxVisibleIndex = 0;

        let from = null;
        let to = null;

        let points = [];
        visibleRoutePoints = [];

        if (uiState.selectedRoute?.from && uiState.selectedRoute?.to) {
            from = uiState.selectedRoute.from;
            to = uiState.selectedRoute.to;

            const p1 = Polygon4.fromRect(from.rect).rotate(from.rotate, from.rect.cx, from.rect.cy);
            const p2 = Polygon4.fromRect(to.rect).rotate(to.rotate, to.rect.cx, to.rect.cy);

            points = getGraphPoints(
                new Rectangle(new Point(p1.x1, p1.y1), new Point(p1.x2, p1.y2), new Point(p1.x3, p1.y3), new Point(p1.x4, p1.y4)),
                new Rectangle(new Point(p2.x1, p2.y1), new Point(p2.x2, p2.y2), new Point(p2.x3, p2.y3), new Point(p2.x4, p2.y4)),
                uiState.selectedRoute.exceptUnaccessible,
                true
            );

            if (points.length < 2) return store.routeStore.updateRoutePoints(points);

            let index = 0;

            for (let i = 1; i < points.length; i++) {
                const cp = points[i];
                const pp = points[i - 1];

                dotsDrawer.updateCenter(`Dot_${index}`, [cp.x, cp.y]);
                dotsDrawer.updateVisible(`Dot_${index}`, true);
                dotsDrawer.updateSkipdim(`Dot_${index}`, true);
                visibleRoutePoints.push(cp);

                index++;

                const len = lineLength(cp, pp);
                if (len < minInterval) continue;
                const steps = Math.floor(len / minInterval);

                for (let j = 0; j < steps; j++) {
                    const p: Point = shiftPoint(pp, ((j + 1) * len) / steps, lineAngle(pp, cp));

                    dotsDrawer.updateCenter(`Dot_${index}`, [p.x, p.y]);
                    dotsDrawer.updateVisible(`Dot_${index}`, true);
                    dotsDrawer.updateSkipdim(`Dot_${index}`, true);
                    visibleRoutePoints.push(p);
                    index++;
                }
            }

            maxVisibleIndex = index;
            for (let i = pointsCount - 1; i > maxVisibleIndex; i--) dotsDrawer.updateVisible(`Dot_${i}`, false);

            locationsDrawer.updateCenter("destinationLocation", [points[0].x, points[0].y]);
            locationsDrawer.updateVisible("destinationLocation", true);

            locationsDrawer.updateCenter("currentLocation", [points[points.length - 1].x, points[points.length - 1].y]);

            const rotation = (-1 * lineAngle(points[points.length - 1], points[points.length - 2]) * Math.PI) / 180;
            locationsDrawer.updateRotation("currentLocation", rotation);
            locationsDrawer.updateVisible("currentLocation", true);

            let { x1, x2, y1, y2 } = Rect.fromMultiple([uiState.selectedRoute.from.rect, uiState.selectedRoute.to.rect]);
            points.forEach((p) => {
                if (p.x < x1) x1 = p.x;
                if (p.x > x2) x2 = p.x;
                if (p.y < y1) y1 = p.y;
                if (p.y > y2) y2 = p.y;
            });
            uiState.moveToRect = Rect.fromX1y1x2y2(x1, y1, x2, y2);
        } else {
            locationsDrawer.updateVisible("currentLocation", false);
            locationsDrawer.updateVisible("destinationLocation", false);
        }

        store.routeStore.updateRoutePoints(points);
    }

    function updateCurrentPosition() {
        let position = store.routeStore.currentPosition;
        if (position) {
            locationsDrawer.updateVisible("currentLocation", true);
            locationsDrawer.updateCenter("currentLocation", [position.x, position.y]);
        } else locationsDrawer.updateVisible("currentLocation", false);

        const shortestrPerp = visibleRoutePoints
            .map((p, i) => {
                if (i === 0) return null;
                let perp = perpendicularToLine(position, visibleRoutePoints[i], visibleRoutePoints[i - 1]);
                if (!perp.isInside) return null;

                return {
                    i,
                    p: perp.p,
                    angle: -1 * lineAngle(visibleRoutePoints[i], visibleRoutePoints[i - 1]),
                    l: lineLength(position, perp.p),
                };
            })
            .filter((p) => p)
            .sort((p1, p2) => p1.l - p2.l)[0];

        locationsDrawer.updateCenter("currentLocation", [
            shortestrPerp?.p?.x || position?.x || 0,
            shortestrPerp?.p?.y || position?.y || 0,
        ]);

        locationsDrawer.updateRotation(
            "currentLocation",
            ((position?.angle != null ? position?.angle : shortestrPerp?.angle || 0) * Math.PI) / 180
        );

        if (!shortestrPerp || !visibleRoutePoints.length) return;

        for (let index = visibleRoutePoints.length+1; index > shortestrPerp.i; index--) {           
     
            dotsDrawer.updateSkipdim(`Dot_${index}`, false);
        }
    }

    if (context.updatable) {
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
