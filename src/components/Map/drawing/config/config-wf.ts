import Color from "color";
import { select } from "d3-selection";
import { reaction } from "mobx";
import Polygon4 from "../../../../core/Polygon";
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
    pointId,
    Rectangle,
} from "../../../../utils/wayfinding";
import { DrawerContext } from "../Drawer1";
import RectPainter from "../painters/RectPainter";
import { createCircleCanvas } from "./canvases";

const strokeWidth = boothStore.borderWidth * 2.5;

let capFrom = Color("#30AFEB");
let capTo = Color("#FF9E2C");

let lineFrom = capFrom;
let lineTo = capTo;

const linesIds: string[] = [];
const capsIds: string[] = [];

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
    const layer = select(svg).select<SVGAElement>("svg > [data-layer='WF']").node();
    if (!layer) return;

    const lines: Line[] = [];
    layer.childNodes.forEach((node: any) => {
        lines.push(
            new Line(
                new Point(parseFloat(node.attributes.x1.value), parseFloat(node.attributes.y1.value)),
                new Point(parseFloat(node.attributes.x2.value), parseFloat(node.attributes.y2.value)),
                node.getAttribute("data-way-unaccessible") === "true" || false,
                node.getAttribute("data-way-unidirection") === "true" || false,
                node.getAttribute("data-way-hidden") === "true" || false
            )
        );
    });

    const boothsRects = boothStore.booths.map((b) => {
        const p1 = Polygon4.fromRect(b.rect).rotate(b.rotate, b.rect.cx, b.rect.cy);
        return new Rectangle(new Point(p1.x1, p1.y1), new Point(p1.x2, p1.y2), new Point(p1.x3, p1.y3), new Point(p1.x4, p1.y4));
    });

    const linesDrawer = context.requirePainter("WF_lines", RectPainter, painterOrderPriority - 20);
    const capsDrawer = context.requirePainter("WF_caps", RectPainter, painterOrderPriority);
    const currentPositionDrawer = context.requirePainter("wF_cp", RectPainter, painterOrderPriority + 1);

    const dotCanvas1 = createCircleCanvas(strokeWidth * 2.5, context.pixelRatio, "#fff", capFrom.hex());
    const dotCanvas2 = createCircleCanvas(strokeWidth * 2.3, context.pixelRatio, "#fff", capTo.hex());
    const cpCanvas = createCircleCanvas(strokeWidth * 3, context.pixelRatio, "#0000ff");

    const sl = buildGraph(lines, boothsRects, []);

    sl.lines
        .filter((l) => !l.hidden)
        .forEach((line, i) => {
            const center = lineCenter(line.p0, line.p1);
            const length = lineLength(line.p0, line.p1);
            const delta = length / 2 + strokeWidth;

            linesDrawer.addObject({
                id: lineId(line.p0, line.p1),
                center: [center.x, center.y],
                color: lineFrom.vec4(),
                deltas: [-delta, -strokeWidth, delta, strokeWidth],
                rotateRadians: (-1 * (lineAngle(line.p0, line.p1) * Math.PI)) / 180,
                visible: isDebug,
            });
        });

    sl.lineEnds.forEach((lineEnd) => {
        capsDrawer.addObject({
            id: "f_" + pointId(lineEnd),
            center: [lineEnd.x, lineEnd.y],
            deltas: [0, 0, 0, 0],
            deltaPts: [-dotCanvas1.width / 2, -dotCanvas1.width / 2, dotCanvas1.width, dotCanvas1.width],
            canvasTmp: dotCanvas1,
            texPosition: "lefttop",
            visible: isDebug,
        });

        capsDrawer.addObject({
            id: "t_" + pointId(lineEnd),
            center: [lineEnd.x, lineEnd.y],
            deltas: [0, 0, 0, 0],
            deltaPts: [-dotCanvas2.width / 2, -dotCanvas2.width / 2, dotCanvas2.width, dotCanvas2.width],
            canvasTmp: dotCanvas2,
            texPosition: "lefttop",
            visible: false,
        });
    });

    currentPositionDrawer.addObject({
        id: "currentLocation",
        center: [0, 0],
        deltas: [0, 0, 0, 0],
        deltaPts: [-cpCanvas.width / 2, -cpCanvas.width / 2, cpCanvas.width, cpCanvas.width],
        canvasTmp: cpCanvas,
        texPosition: "lefttop",
        visible: isDebug,
    });

    currentPositionDrawer.updateSkipdim("currentLocation", true);

    const updateRoute = () => {
        linesIds.forEach((id) => {
            linesDrawer.updateVisible(id, false);
            linesDrawer.updateSkipdim(id, false);
        });

        capsIds.forEach((id) => {
            capsDrawer.updateVisible(id, false);
            capsDrawer.updateSkipdim(id, false);
        });

        let from = null;
        let to = null;
        let points: Point[] = [];
        let distance: number = 0;

        if (uiState.selectedRoute?.from && uiState.selectedRoute?.to) {
            from = uiState.selectedRoute.from;
            to = uiState.selectedRoute.to;

            const p1 = Polygon4.fromRect(from.rect).rotate(from.rotate, from.rect.cx, from.rect.cy);
            const p2 = Polygon4.fromRect(to.rect).rotate(to.rotate, to.rect.cx, to.rect.cy);

            points = getGraphPoints(
                new Rectangle(new Point(p1.x1, p1.y1), new Point(p1.x2, p1.y2), new Point(p1.x3, p1.y3), new Point(p1.x4, p1.y4)),
                new Rectangle(new Point(p2.x1, p2.y1), new Point(p2.x2, p2.y2), new Point(p2.x3, p2.y3), new Point(p2.x4, p2.y4)),
                uiState.selectedRoute.exceptUnaccessible
            );
            let id: string = null;

            const t = lineTo.rgb().color;
            const f = lineFrom.rgb().color;

            const colors = interpolateColors(`rgb(${t[0]},${t[1]},${t[2]})`, `rgb(${f[0]},${f[1]},${f[2]})`, points.length - 1);
            let distance: number = 0;

            for (let index = 0; index < points.length; index++) {
                const cp = points[index];
                const pp = points[index - 1];

                if (pp) {
                    // Lines
                    id = lineId(cp, pp);
                    if (!linesDrawer.getObject(id)) id = lineId(pp, cp);

                    if (linesDrawer.getObject(id)) {
                        linesDrawer.updateVisible(id, true);
                        linesDrawer.updateColor(id, Color(colors[index - 1]).vec4());
                        linesDrawer.updateSkipdim(id, true);
                        linesIds.push(id);
                        distance += lineLength(cp, pp);
                    }
                }

                let prefix = null;

                if (index === 0) prefix = "t_";
                else if (index === points.length - 1) prefix = "f_";

                id = prefix + pointId(cp);
                if (prefix && capsDrawer.getObject(id)) {
                    capsDrawer.updateVisible(id, true);
                    capsDrawer.updateSkipdim(id, true);
                    capsIds.push(id);
                }
            }

            distance = Math.round(distance / 10);
        }

        if (store.fp.onDirection)
            store.fp.onDirection({
                from: from ? { id: from.id, name: from.name } : null,
                to: to ? { id: to.id, name: to.name } : null,
                points,
                distance: `${distance}${svg.getAttribute("units")}`,
                time: Math.round(distance / 1.4),
            });
    };

    const updateCurrentPosition = () => {
        let position = uiState.currentPosition;
        if (position?.x && position?.y) {
            currentPositionDrawer.updateVisible("currentLocation", true);
            currentPositionDrawer.updateCenter("currentLocation", [position.x, position.y]);
        } else {
            currentPositionDrawer.updateVisible("currentLocation", false);
        }
    };

    if (context.updatable) {
        reaction(
            () => uiState.selectedRoute,
            () => context.requireUpdate(updateRoute)
        );

        reaction(
            () => uiState.position,
            () => context.requireUpdate(updateCurrentPosition)
        );

        updateRoute();
        updateCurrentPosition();
    }
}
