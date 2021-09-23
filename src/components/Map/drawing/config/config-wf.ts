import Color from "color";
import { select } from "d3-selection";
import { reaction } from "mobx";
import Polygon4 from "../../../../core/Polygon";
import svg from "../../../../data/svg";
import { boothStore, uiState } from "../../../../store";
import { buildWays, getWayPoints, Line, Point, Rectangle, subLines } from "../../../../utils/wayfinding";
import { DrawerContext } from "../Drawer1";
import RectPainter from "../painters/RectPainter";
import { createCircleCanvas } from "./canvases";

const strokeWidth = boothStore.borderWidth * 1.2;
const color = Color("#30AFEB");

const ids: string[] = [];

//#region Geometry calculations

const round = (number: number, digits: number = 9) => Math.round(number * Math.pow(10, digits)) / Math.pow(10, digits);

const lineCenter = (line: Line) => new Point((line.p0.x + line.p1.x) / 2, (line.p0.y + line.p1.y) / 2);

const lineLength = (p1: Point, p2: Point): number => round(Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)), 2);

const getDirection = (centerPoint: Point, startPoint: Point, endPoint: Point): number => {
    return (startPoint.x - centerPoint.x) * (endPoint.y - centerPoint.y) -
        (startPoint.y - centerPoint.y) * (endPoint.x - centerPoint.x) <
        0
        ? -1
        : 1;
};

const lineAngle = (startPoint: Point, endPoint: Point): number => {
    let p1 = { x: startPoint.x + 100000, y: startPoint.y };

    let a = lineLength(p1, startPoint);
    let b = lineLength(endPoint, startPoint);
    let c = lineLength(p1, endPoint);
    let cos = (Math.pow(a, 2) + Math.pow(b, 2) - Math.pow(c, 2)) / (2 * a * b);

    let direction = getDirection(startPoint, p1, endPoint);

    return direction * round((Math.acos(cos > 1 ? 1 : cos) * 180) / Math.PI, 3);
};

//#endregion

const lineId = (p0: Point, p1: Point): string => `${p0.x}_${p0.y}_${p1.x}_${p1.y}`;

const pointId = (p: Point): string => `${p.x}_${p.y}`;

export default function configWf(context: DrawerContext, painterOrderPriority: number) {
    let drawer: RectPainter = null;
    let drawerSeq = 0;

    var layer = select(svg).select<SVGAElement>("svg > [data-layer='WF']").node();
    if (!layer) return;

    let lines: Line[] = [];
    layer.childNodes.forEach((node: any) => {
        lines.push(
            new Line(
                { x: parseFloat(node.attributes.x1.value), y: parseFloat(node.attributes.y1.value) },
                { x: parseFloat(node.attributes.x2.value), y: parseFloat(node.attributes.y2.value) }
            )
        );
    });

    const boothsRects = boothStore.booths.map((b) => {
        const p1 = Polygon4.fromRect(b.rect).rotate(b.rotate, b.rect.cx, b.rect.cy);
        return new Rectangle(new Point(p1.x1, p1.y1), new Point(p1.x2, p1.y2), new Point(p1.x3, p1.y3), new Point(p1.x4, p1.y4));
    });

    let sl = subLines(lines.concat(buildWays(lines, boothsRects, []) || []));

    drawer = context.requirePainter("WF" + drawerSeq++, RectPainter, painterOrderPriority);

    sl.lines.forEach((line, i) => {
        const center = lineCenter(line);
        const length = lineLength(line.p0, line.p1);
        const delta = length / 2 + strokeWidth;

        drawer.addObject({
            id: lineId(line.p0, line.p1),
            center: [center.x, center.y],
            color: color.vec4(),
            deltas: [-delta, -strokeWidth, delta, strokeWidth],
            rotateRadians: (-1 * (lineAngle(line.p0, line.p1) * Math.PI)) / 180,
            visible: false,
        });
    });

    let dotCanvas = createCircleCanvas(strokeWidth * 4, context.pixelRatio, "#fff", color.hex());

    sl.lineEnds.forEach((lineEnd) => {
        drawer.addObject({
            id: pointId(lineEnd),
            center: [lineEnd.x, lineEnd.y],
            deltas: [0, 0, 0, 0],
            deltaPts: [-dotCanvas.width / 2, -dotCanvas.width / 2, dotCanvas.width, dotCanvas.width],
            canvasTmp: dotCanvas,
            texPosition: "lefttop",
            visible: false,
        });
    });

    const update = () => {
        ids.forEach((id) => drawer.updateVisible(id, false));

        if (!uiState.selectedRoute) return;

        let { from, to } = uiState.selectedRoute;

        if (!from || !to) return;

        const p1 = Polygon4.fromRect(from.rect).rotate(from.rotate, from.rect.cx, from.rect.cy);
        const p2 = Polygon4.fromRect(to.rect).rotate(to.rotate, to.rect.cx, to.rect.cy);

        let points = getWayPoints(
            sl.lines,
            new Rectangle(new Point(p1.x1, p1.y1), new Point(p1.x2, p1.y2), new Point(p1.x3, p1.y3), new Point(p1.x4, p1.y4)),
            new Rectangle(new Point(p2.x1, p2.y1), new Point(p2.x2, p2.y2), new Point(p2.x3, p2.y3), new Point(p2.x4, p2.y4))
        );

        for (let index = 1; index < points.length; index++) {
            const pp = points[index - 1];
            const cp = points[index];
            let id = lineId(cp, pp);
            if (!drawer.getObject(id)) id = lineId(pp, cp);

            drawer.updateVisible(id, true);
            ids.push(id);

            // Points ids
            id = pointId(pp);
            if (!drawer.getObject(id)) id = pointId(cp);

            if (!drawer.getObject(id)) continue;

            drawer.updateVisible(id, true);
            ids.push(id);
        }
    };

    reaction(
        () => uiState.selectedRoute,
        () => update()
    );
}
