import Color from "color";
import { select } from "d3-selection";
import { reaction } from "mobx";
import Polygon4 from "../../../../core/Polygon";
import Rect from "../../../../core/Rect";
import svg from "../../../../data/svg";
import store, { boothStore, uiState } from "../../../../store";
import { buildGraph, getGraphLines, lineAngle, lineLength, Point, Rectangle, RouteLine } from "../../../../utils/wayfinding";
import { DrawerContext } from "../Drawer1";
import RectPainter from "../painters/RectPainter";
import { createCircleCanvas, createCurrentCanvas, createTargetCanvas, createTriangleCanvas } from "./canvases";

let visibleCorners: {
    index: number;
    point: Point;

    triangles: {
        index: number;
        point: Point;
    }[];
}[] = [];

const isDebug = false;

const trianglesCount = 250;
const cornersCount = 50;

const minInterval = (boothStore.borderWidth < 5 ? 5 : boothStore.borderWidth) * 10;

let fromColor = Color("#30AFEB");
let middleColor = Color("#98A78C");
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

    const currentLocationCanvas = createCurrentCanvas(context.pixelRatio, fromColor.hex());
    const destinationLocationCanvas = createTargetCanvas(context.pixelRatio, toColor.hex());

    const cornerCanvas = createCircleCanvas(5, context.pixelRatio, middleColor.hex());
    const triangleCanvas = createTriangleCanvas(context.pixelRatio, fromColor.hex(), 1.4);

    for (let i = 0; i < cornersCount; i++) {
        wfDrawer.addObject({
            id: `Dot_c_${i.toString()}`,
            center: [0, 0],
            deltaPts: [-cornerCanvas.width / 2, -cornerCanvas.width / 2, cornerCanvas.width, cornerCanvas.width],
            canvasTmp: cornerCanvas,
            texPosition: "lefttop",
            visible: isDebug,
        });
    }

    for (let i = cornersCount; i < trianglesCount; i++) {
        wfDrawer.addObject({
            id: `Dot_${i.toString()}`,
            center: [0, 0],
            deltaPts: [-triangleCanvas.width / 2, -triangleCanvas.width / 2, triangleCanvas.width, triangleCanvas.width],
            canvasTmp: triangleCanvas,
            texPosition: "lefttop",
            visible: isDebug,
        });
    }

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
            -currentLocationCanvas.width / 2,
            -currentLocationCanvas.height / 2,
            currentLocationCanvas.width,
            currentLocationCanvas.height,
        ],
        canvasTmp: currentLocationCanvas,
        texPosition: "lefttop",
        visible: isDebug,
    });

    wfDrawer.updateSkipdim("destinationLocation", true);
    wfDrawer.updateSkipdim("currentLocation", true);

    function updateRoute() {
        visibleCorners.forEach((vc) => {
            wfDrawer.updateVisible(`Dot_c_${vc.index}`, false);
            vc.triangles.forEach((t) => wfDrawer.updateVisible(`Dot_${t.index}`, false));
        });

        visibleCorners = [];

        let graphLines: RouteLine[] = [];

        if (uiState.selectedRoute?.from && uiState.selectedRoute?.to) {
            let from = uiState.selectedRoute.from;
            let to = uiState.selectedRoute.to;

            const p1 = Polygon4.fromRect(from.rect).rotate(from.rotate, from.rect.cx, from.rect.cy);
            const p2 = Polygon4.fromRect(to.rect).rotate(to.rotate, to.rect.cx, to.rect.cy);

            graphLines = getGraphLines(
                new Rectangle(new Point(p1.x1, p1.y1), new Point(p1.x2, p1.y2), new Point(p1.x3, p1.y3), new Point(p1.x4, p1.y4)),
                new Rectangle(new Point(p2.x1, p2.y1), new Point(p2.x2, p2.y2), new Point(p2.x3, p2.y3), new Point(p2.x4, p2.y4)),
                uiState.selectedRoute.exceptUnaccessible
            );

            if (graphLines.length < 1) return store.routeStore.updateRoutePoints(graphLines);

            let visibleTriangles: number = 0;

            for (let i = 0; i < graphLines.length; i++) {
                const pl = graphLines[i - 1];
                const cl = graphLines[i];

                let corners = visibleCorners.length;
                if (cl.virtual) continue;

                if (pl?.virtual && !cl.virtual) visibleCorners.push({ index: i, point: cl.p0, triangles: [] });

                visibleCorners.push({ index: i, point: cl.p1, triangles: [] });

                for (let i = corners; i < visibleCorners.length; i++) {
                    let newCorner = visibleCorners[i];
                    wfDrawer.updateCenter(`Dot_c_${i}`, [newCorner.point.x, newCorner.point.y]);
                    wfDrawer.updateVisible(`Dot_c_${i}`, true);
                    wfDrawer.updateSkipdim(`Dot_c_${i}`, true);
                }

                const len = lineLength(cl.p0, cl.p1);

                if (len < minInterval) continue;
                const steps = Math.floor(len / minInterval);

                for (let j = 0; j < steps - 1; j++) {
                    const point: Point = shiftPoint(cl.p0, ((j + 1) * len) / steps, lineAngle(cl.p0, cl.p1));
                    const index = cornersCount + visibleTriangles;

                    wfDrawer.updateCenter(`Dot_${index}`, [point.x, point.y]);
                    wfDrawer.updateVisible(`Dot_${index}`, true);
                    wfDrawer.updateSkipdim(`Dot_${index}`, true);
                    wfDrawer.updateRotation(`Dot_${index}`, (-1 * lineAngle(cl.p1, cl.p0) * Math.PI) / 180);

                    visibleCorners[visibleCorners.length - 1].triangles.push({ index, point });
                    visibleTriangles++;
                }
            }

            for (let i = visibleCorners.length + 1; i < cornersCount; i++) wfDrawer.updateVisible(`Dot_c_${i}`, false);

            for (let i = cornersCount + visibleTriangles; i < trianglesCount; i++) wfDrawer.updateVisible(`Dot_${i}`, false);

            wfDrawer.updateCenter("destinationLocation", [graphLines[0].p0.x, graphLines[0].p0.y]);
            wfDrawer.updateVisible("destinationLocation", true);

            wfDrawer.updateCenter("currentLocation", [
                graphLines[graphLines.length - 1].p1.x,
                graphLines[graphLines.length - 1].p1.y,
            ]);

            const rotation =
                (-1 * lineAngle(graphLines[graphLines.length - 1].p1, graphLines[graphLines.length - 1].p0) * Math.PI) / 180;

            wfDrawer.updateRotation("currentLocation", rotation);
            wfDrawer.updateVisible("currentLocation", true);

            let { x1, x2, y1, y2 } = Rect.fromMultiple([uiState.selectedRoute.from.rect, uiState.selectedRoute.to.rect]);
            graphLines.forEach((l) => {
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
            wfDrawer.updateVisible("currentLocation", false);
            wfDrawer.updateVisible("destinationLocation", false);
        }

        store.routeStore.updateRoutePoints(graphLines.filter((gl) => !gl.virtual));
    }

    function updateCurrentPosition() {
        let position = store.routeStore.currentPosition;
        if (position) {
            wfDrawer.updateVisible("currentLocation", true);
            wfDrawer.updateCenter("currentLocation", [position.x, position.y]);
        } else wfDrawer.updateVisible("currentLocation", false);

        const shortestrPerp = visibleCorners
            .map((p, i) => {
                if (i === 0) return null;
                let perp = perpendicularToLine(position, visibleCorners[i].point, visibleCorners[i - 1].point);
                if (!perp.isInside) return null;

                return {
                    i,
                    p: perp.p,
                    angle: -1 * lineAngle(visibleCorners[i].point, visibleCorners[i - 1].point),
                    l: lineLength(position, perp.p),
                };
            })
            .filter((p) => p)
            .sort((p1, p2) => p1.l - p2.l)[0];

        wfDrawer.updateCenter("currentLocation", [
            shortestrPerp?.p?.x || position?.x || 0,
            shortestrPerp?.p?.y || position?.y || 0,
        ]);

        wfDrawer.updateRotation(
            "currentLocation",
            ((position?.angle != null ? position?.angle : shortestrPerp?.angle || 0) * Math.PI) / 180
        );

        if (!shortestrPerp || !visibleCorners.length) return;

        for (let index = visibleCorners.length - 1; index > shortestrPerp.i; index--) {
            let corner = visibleCorners[index];
            wfDrawer.updateSkipdim(`Dot_c_${corner.index}`, false);
            corner.triangles.forEach((t) => wfDrawer.updateSkipdim(`Dot_${t.index}`, false));
        }
    }

    if (context.updatable) {
        let prevScale: number = null;

        reaction(
            () => context.ptscale,
            () => {
                let v = Math.round((context.ptscale * context.pixelRatio) / 3);
                if (v === prevScale || v % 3 === 0) return;
                if (v > 15) v = 15;

                visibleCorners.forEach((corner) =>
                    corner.triangles.forEach((t) => wfDrawer.updateVisible(`Dot_${t.index}`, t.index % (v || 1) === 0))
                );

                prevScale = v;
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
