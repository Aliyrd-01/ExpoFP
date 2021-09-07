import Color from "color";
import { select } from "d3-selection";
import Polygon4 from "../../../../core/Polygon";
import Rect from "../../../../core/Rect";
import svg from "../../../../data/svg";
import { boothStore } from "../../../../store";
import { getWayPoints, Line, Point } from "../../../../utils/wayfinding";
import { DrawerContext } from "../Drawer1";
import TrianglePainter, { TrianglePainterObject } from "../painters/TrianglePainter";
import { Booth } from "./../../../../store/BoothStore";
import { Rectangle } from "./../../../../utils/wayfinding";

const size = boothStore.borderWidth * 2;
const color = Color("black").vec4();

let lines: Line[] = [];

export default function configWf(context: DrawerContext, painterOrderPriority: number) {
    let drawer: TrianglePainter = null;
    let drawerSeq = 0;

    select(svg)
        .select<SVGAElement>("svg > [data-layer='WF']")
        .node()
        .childNodes.forEach((node: any) => {
            lines.push(
                new Line(
                    { x: parseFloat(node.attributes.x1.value), y: parseFloat(node.attributes.y1.value) },
                    { x: parseFloat(node.attributes.x2.value), y: parseFloat(node.attributes.y2.value) }
                )
            );
        });

    function addRect(point: Point) {
        const r = Rect.fromXywh(point.x - size, point.y - size, 2 * size, 2 * size);

        addObject({
            p0: [r.x1, r.y1],
            p1: [r.x2, r.y1],
            p2: [r.x1, r.y2],
            color,
        });
        addObject({
            p1: [r.x2, r.y1],
            p2: [r.x1, r.y2],
            p0: [r.x2, r.y2],
            color,
        });
    }

    function addObject(item: TrianglePainterObject) {
        while (!drawer || !drawer.tryAddObject(item)) {
            drawer = context.requirePainter("WF" + drawerSeq++, TrianglePainter, painterOrderPriority);
        }
    }

    setTimeout(() => {
        let booths: Set<Booth> = new Set(boothStore.booths.filter((b) => b.name == "6" || b.name == "56"));

        let iterator = booths.values();
        let from = iterator.next().value;
        let to = iterator.next().value;

        const p1 = Polygon4.fromRect(from.rect).rotate(from.rotate, from.rect.cx, from.rect.cy);
        const p2 = Polygon4.fromRect(to.rect).rotate(to.rotate, to.rect.cx, to.rect.cy);

        let points = getWayPoints(
            lines,
            new Rectangle(new Point(p1.x1, p1.y1), new Point(p1.x2, p1.y2), new Point(p1.x3, p1.y3), new Point(p1.x4, p1.y4)),
            new Rectangle(new Point(p2.x1, p2.y1), new Point(p2.x2, p2.y2), new Point(p2.x3, p2.y3), new Point(p2.x4, p2.y4))
        );

        points.forEach((p) => addRect(p));
    }, 100);
}
