import Color from "color";
import { select } from "d3-selection";
import svg from "../../../../data/svg";
import { boothStore } from "../../../../store";
import { Line, Point, subLines } from "../../../../utils/wayfinding";
import { DrawerContext } from "../Drawer1";
import RectPainter from "../painters/RectPainter";

const size = boothStore.borderWidth;

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
        var color = Color.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255).vec4();

        drawer.addObject({
            id: `${line.p0.x}_${line.p0.y}_${line.p1.x}_${line.p1.y}`,
            center: [center.x, center.y],
            color,
            deltas: [-length / 2, -size / 2, length / 2, size / 2],
            rotateRadians: (-1 * (lineAngle(line.p0, line.p1) * Math.PI)) / 180           
        });
    });
}
