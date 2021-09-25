import Color from "color";
import { select } from "d3-selection";
import { reaction } from "mobx";
import Polygon4 from "../../../../core/Polygon";
import svg from "../../../../data/svg";
import { boothStore, uiState } from "../../../../store";
import {
    buildGraph,
    getGraphPoints,
    Line,
    lineAngle,
    lineCenter,
    lineId,
    lineLength,
    Point,
    pointId,
    Rectangle,
} from "../../../../utils/wayfinding";
import { DrawerContext } from "../Drawer1";
import RectPainter from "../painters/RectPainter";
import { createCircleCanvas } from "./canvases";

const strokeWidth = boothStore.borderWidth * 2;
const fromColor = Color("#30AFEB");
const toColor = Color("#FF9E2C");

const ids: string[] = [];

const isDebug = false;

const interpolateColors = (color1, color2, steps) => {
    const interpolateColor = (color1, color2, factor = 0.5) => {
        var result = color1.slice();
        for (var i = 0; i < 3; i++) result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
        return result;
    };

    var stepFactor = 1 / (steps - 1),
        interpolatedColorArray = [];

    color1 = color1.match(/\d+/g).map(Number);
    color2 = color2.match(/\d+/g).map(Number);

    for (var i = 0; i < steps; i++) interpolatedColorArray.push(interpolateColor(color1, color2, stepFactor * i));

    return interpolatedColorArray;
};

export default function configWf(context: DrawerContext, painterOrderPriority: number) {
    let drawerSeq = 0;

    const layer = select(svg).select<SVGAElement>("svg > [data-layer='WF']").node();
    if (!layer) return;

    const lines: Line[] = [];
    layer.childNodes.forEach((node: any) => {
        lines.push(
            new Line(
                new Point(parseFloat(node.attributes.x1.value), parseFloat(node.attributes.y1.value)),
                new Point(parseFloat(node.attributes.x2.value), parseFloat(node.attributes.y2.value))
            )
        );
    });

    const boothsRects = boothStore.booths.map((b) => {
        const p1 = Polygon4.fromRect(b.rect).rotate(b.rotate, b.rect.cx, b.rect.cy);
        return new Rectangle(new Point(p1.x1, p1.y1), new Point(p1.x2, p1.y2), new Point(p1.x3, p1.y3), new Point(p1.x4, p1.y4));
    });

    const drawer = context.requirePainter("WF" + drawerSeq++, RectPainter, painterOrderPriority);

    const dotCanvas1 = createCircleCanvas(strokeWidth * 4, context.pixelRatio, "#fff", fromColor.hex());
    const dotCanvas2 = createCircleCanvas(strokeWidth * 3.8, context.pixelRatio, "#fff", toColor.hex());

    const sl = buildGraph(lines, boothsRects, []);

    sl.lines.forEach((line, i) => {
        const center = lineCenter(line.p0, line.p1);
        const length = lineLength(line.p0, line.p1);
        const delta = length / 2 + strokeWidth;

        drawer.addObject({
            id: lineId(line.p0, line.p1),
            center: [center.x, center.y],
            color: fromColor.vec4(),
            deltas: [-delta, -strokeWidth, delta, strokeWidth],
            rotateRadians: (-1 * (lineAngle(line.p0, line.p1) * Math.PI)) / 180,
            visible: isDebug,
        });
    });

    sl.lineEnds.forEach((lineEnd) => {
        drawer.addObject({
            id: "f_" + pointId(lineEnd),
            center: [lineEnd.x, lineEnd.y],
            deltas: [0, 0, 0, 0],
            deltaPts: [-dotCanvas1.width / 2, -dotCanvas1.width / 2, dotCanvas1.width, dotCanvas1.width],
            canvasTmp: dotCanvas1,
            texPosition: "lefttop",
            visible: isDebug,
        });

        drawer.addObject({
            id: "t_" + pointId(lineEnd),
            center: [lineEnd.x, lineEnd.y],
            deltas: [0, 0, 0, 0],
            deltaPts: [-dotCanvas2.width / 2, -dotCanvas2.width / 2, dotCanvas2.width, dotCanvas2.width],
            canvasTmp: dotCanvas2,
            texPosition: "lefttop",
            visible: false,
        });
    });

    const update = () => {
        ids.forEach((id) => drawer.updateVisible(id, false));

        if (!uiState.selectedRoute) return;

        const { from, to } = uiState.selectedRoute;

        if (!from || !to) return;

        const p1 = Polygon4.fromRect(from.rect).rotate(from.rotate, from.rect.cx, from.rect.cy);
        const p2 = Polygon4.fromRect(to.rect).rotate(to.rotate, to.rect.cx, to.rect.cy);

        const points = getGraphPoints(
            new Rectangle(new Point(p1.x1, p1.y1), new Point(p1.x2, p1.y2), new Point(p1.x3, p1.y3), new Point(p1.x4, p1.y4)),
            new Rectangle(new Point(p2.x1, p2.y1), new Point(p2.x2, p2.y2), new Point(p2.x3, p2.y3), new Point(p2.x4, p2.y4))
        );
        let id: string = null;

        const t = toColor.rgb().color;
        const f = fromColor.rgb().color;

        const colors = interpolateColors(`rgb(${t[0]},${t[1]},${t[2]})`, `rgb(${f[0]},${f[1]},${f[2]})`, points.length - 1);

        for (let index = 0; index < points.length; index++) {
            const cp = points[index];

            let prefix = null;
            if (index === 0) prefix = "t_";
            else if (index === points.length - 1) prefix = "f_";

            id = prefix + pointId(cp);
            if (prefix && drawer.getObject(id)) {
                drawer.updateVisible(id, true);
                ids.push(id);
            }

            if (index === 0) continue;

            // Lines
            const pp = points[index - 1];

            id = lineId(cp, pp);
            if (!drawer.getObject(id)) id = lineId(pp, cp);

            drawer.updateVisible(id, true);
            drawer.updateColor(id, Color(colors[index - 1]).vec4());

            ids.push(id);
        }
    };

    reaction(
        () => uiState.selectedRoute,
        () => update()
    );
}
