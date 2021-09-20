import Color from "color";
import { select } from "d3-selection";
import { reaction } from "mobx";
import Polygon4 from "../../../../core/Polygon";
import svg from "../../../../data/svg";
import { boothStore, uiState } from "../../../../store";
import { getWayPoints, Line, Point, Rectangle, subLines } from "../../../../utils/wayfinding";
import { DrawerContext } from "../Drawer1";
import RectPainter from "../painters/RectPainter";

const size = boothStore.borderWidth / 5;
const color = Color("black").vec4();
const ids: string[] = [];

const lineCenter = (line: Line) => new Point((line.p0.x + line.p1.x) / 2, (line.p0.y + line.p1.y) / 2);

const round = (number: number, digits: number = 9) => Math.round(number * Math.pow(10, digits)) / Math.pow(10, digits);

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

const lineId = (p0: Point, p1: Point): string => `${p0.x}_${p0.y}_${p1.x}_${p1.y}`;

let lines: Line[] = [];

export default function configWf(context: DrawerContext, painterOrderPriority: number) {
    let drawer: RectPainter = null;
    let drawerSeq = 0;

    var layer = select(svg).select<SVGAElement>("svg > [data-layer='WF']").node();
    if (!layer) return;

    layer.childNodes.forEach((node: any) => {
        lines.push(
            new Line(
                { x: parseFloat(node.attributes.x1.value), y: parseFloat(node.attributes.y1.value) },
                { x: parseFloat(node.attributes.x2.value), y: parseFloat(node.attributes.y2.value) }
            )
        );
    });

    lines = subLines(lines);

    drawer = context.requirePainter("WF" + drawerSeq++, RectPainter, painterOrderPriority);

    lines.forEach((line, i) => {
        const center = lineCenter(line);
        const length = lineLength(line.p0, line.p1);

        drawer.addObject({
            id: lineId(line.p0, line.p1),
            center: [center.x, center.y],
            color: color,
            deltas: [-length / 2, -size, length / 2, size],
            rotateRadians: (-1 * (lineAngle(line.p0, line.p1) * Math.PI)) / 180,
            visible: false,
        });
    });

    const updateDestination = () => {
        ids.forEach((id) => drawer.updateVisible(id, false));

        let from = uiState.selectedBooth;
        let to = uiState.destination;

        if (!from || !to) {
            if (uiState.destination) uiState.destination = null;
            return;
        }

        const p1 = Polygon4.fromRect(from.rect).rotate(from.rotate, from.rect.cx, from.rect.cy);
        const p2 = Polygon4.fromRect(to.rect).rotate(to.rotate, to.rect.cx, to.rect.cy);

        let points = getWayPoints(
            lines,
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
        }
    };

    reaction(
        () => uiState.selectedBooth,
        () => updateDestination()
    );

    reaction(
        () => uiState.destination,
        () => updateDestination()
    );
}
