import Color from "color";
import { select } from "d3-selection";
import { reaction } from "mobx";
import Polygon4 from "../../../../core/Polygon";
import Rect from "../../../../core/Rect";
import svg from "../../../../data/svg";
import store, { boothStore, uiState } from "../../../../store";
import {
    buildGraph,
    getGraphPoints,
    Line,
    lineAngle,
    lineCenter,
    lineId,
    lineLength,
    Point,
    Rectangle,
} from "../../../../utils/wayfinding";
import { DrawerContext } from "../Drawer1";
import RectPainter from "../painters/RectPainter";
import { createCurrentCanvas, createTargetCanvas } from "./canvases";

const strokeWidth = Math.min(5, boothStore.borderWidth * 2.5);
const mainColor = Color("#bc237d");

const visibleLinesIds: string[] = [];
let routePoints: Point[] = [];

const isDebug = false;

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

    const linesDrawer = context.requirePainter("WF_lines", RectPainter, painterOrderPriority - 20);

    const locationsDrawer = context.requirePainter("wF_locations", RectPainter, painterOrderPriority + 1);
    const currentLocationCanvas = createCurrentCanvas(context.pixelRatio, mainColor.hex());
    const destinationLocationCanvas = createTargetCanvas(context.pixelRatio, mainColor.hex());

    const sl = buildGraph(lines, boothsRects, [], 300);

    sl.lines
        .filter((l) => !l.virtual)
        .forEach((line) => {
            const center = lineCenter(line.p0, line.p1);
            const length = lineLength(line.p0, line.p1);
            const delta = length / 2 + strokeWidth;

            linesDrawer.addObject({
                id: lineId(line.p0, line.p1),
                center: [center.x, center.y],
                color: mainColor.vec4(),
                deltas: [-delta, -strokeWidth, delta, strokeWidth],
                rotateRadians: (-1 * (lineAngle(line.p0, line.p1) * Math.PI)) / 180,
                visible: isDebug,
            });
        });

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

    function getlineIdByPoints(p0: Point, p1: Point): string {
        let id = lineId(p0, p1);
        const obj = linesDrawer.getObject(id);
        if (obj) return id;
        id = lineId(p1, p0);
        return linesDrawer.getObject(id) ? id : null;
    }

    function updateRoute() {
        visibleLinesIds.forEach((id) => {
            linesDrawer.updateVisible(id, false);
            linesDrawer.updateSkipdim(id, false);
        });

        let from = null;
        let to = null;

        routePoints = [];

        if (uiState.selectedRoute?.from && uiState.selectedRoute?.to) {
            from = uiState.selectedRoute.from;
            to = uiState.selectedRoute.to;

            const p1 = Polygon4.fromRect(from.rect).rotate(from.rotate, from.rect.cx, from.rect.cy);
            const p2 = Polygon4.fromRect(to.rect).rotate(to.rotate, to.rect.cx, to.rect.cy);

            routePoints = getGraphPoints(
                new Rectangle(new Point(p1.x1, p1.y1), new Point(p1.x2, p1.y2), new Point(p1.x3, p1.y3), new Point(p1.x4, p1.y4)),
                new Rectangle(new Point(p2.x1, p2.y1), new Point(p2.x2, p2.y2), new Point(p2.x3, p2.y3), new Point(p2.x4, p2.y4)),
                uiState.selectedRoute.exceptUnaccessible
            );

            if (routePoints.length < 2) return store.routeStore.updateRoutePoints(routePoints);

            for (let index = 1; index < routePoints.length; index++) {
                const cp = routePoints[index];
                const pp = routePoints[index - 1];

                const id = getlineIdByPoints(cp, pp);
                if (id) {
                    linesDrawer.updateVisible(id, true);
                    linesDrawer.updateSkipdim(id, true);
                    visibleLinesIds.push(id);
                }
            }

            locationsDrawer.updateCenter("destinationLocation", [routePoints[0].x, routePoints[0].y]);
            locationsDrawer.updateVisible("destinationLocation", true);

            locationsDrawer.updateCenter("currentLocation", [
                routePoints[routePoints.length - 1].x,
                routePoints[routePoints.length - 1].y,
            ]);

            const rotation =
                (-1 * lineAngle(routePoints[routePoints.length - 1], routePoints[routePoints.length - 2]) * Math.PI) / 180;
            locationsDrawer.updateRotation("currentLocation", rotation);
            locationsDrawer.updateVisible("currentLocation", true);

            let { x1, x2, y1, y2 } = Rect.fromMultiple([uiState.selectedRoute.from.rect, uiState.selectedRoute.to.rect]);
            routePoints.forEach((p) => {
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

        store.routeStore.updateRoutePoints(routePoints);
    }

    function updateCurrentPosition() {
        let position = store.routeStore.currentPosition;
        if (position) {
            locationsDrawer.updateVisible("currentLocation", true);
            locationsDrawer.updateCenter("currentLocation", [position.x, position.y]);
        } else locationsDrawer.updateVisible("currentLocation", false);

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

        locationsDrawer.updateCenter("currentLocation", [
            shortestrPerp?.p?.x || position?.x || 0,
            shortestrPerp?.p?.y || position?.y || 0,
        ]);

        locationsDrawer.updateRotation(
            "currentLocation",
            ((position?.angle != null ? position?.angle : shortestrPerp?.angle || 0) * Math.PI) / 180
        );

        if (!shortestrPerp || !routePoints.length) return;

        for (let index = routePoints.length - 1; index > shortestrPerp.i; index--) {
            let pPoint = routePoints[index];
            let point = routePoints[index - 1];
            linesDrawer.updateSkipdim(getlineIdByPoints(pPoint, point), false);
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
