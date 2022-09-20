import { lineAngle, lineLength, Point, pointInsideRectangle, Rect } from "simple-geometry";
import Polygon4 from "../core/Polygon";
import { Booth } from "../store/BoothStore";

const path = require("ngraph.path");
const createGraph = require("ngraph.graph");

export class RouteLine {
    constructor(
        public p0: RoutePoint,
        public p1: RoutePoint,
        public unaccessible: boolean,
        public unidirection: boolean,
        public virtual: boolean,
        public ended: boolean,
        public weight: number
    ) {}
}

export class RoutePoint {
    constructor(public layer: string, public x: number, public y: number) {}
}

type Sublines = { lines: RouteLine[]; lineEnds: RoutePoint[] };

const pointId = (p: RoutePoint): string => `${p.layer}_${p.x}_${p.y}`;

const samePoint = (p1: RoutePoint, p2: RoutePoint): boolean => p1.layer === p2.layer && lineLength(p1, p2) <= 1;

const sameLine = (l: RouteLine, p0: RoutePoint, p1: RoutePoint): boolean =>
    (samePoint(l.p0, p0) && samePoint(l.p1, p1) && l.p0.layer === p0.layer && l.p1.layer === p1.layer) ||
    (samePoint(l.p0, p1) && samePoint(l.p1, p0) && l.p0.layer === p1.layer && l.p1.layer === p0.layer);

let sublines = (): Sublines => window["__wfData"];
let pathFinder = { finder: null, oriented: true, exceptUnAccessible: false };

function buildPathFinder(oriented: boolean, exceptUnAccessible: boolean) {
    const graph = createGraph();
    const t0 = performance.now();

    let { lines } = sublines();

    lines.forEach((line) => {
        if (!exceptUnAccessible || !line.unaccessible) {
            graph.addLink(pointId(line.p0), pointId(line.p1), {
                distance: line.virtual ? 0 : lineLength(line.p0, line.p1) / (line.weight || 4),
            });

            if (oriented && !line.unidirection)
                graph.addLink(pointId(line.p1), pointId(line.p0), {
                    distance: line.virtual ? 0 : lineLength(line.p1, line.p0) / (line.weight || 4),
                });
        }
    });

    pathFinder.oriented = oriented;
    pathFinder.exceptUnAccessible = exceptUnAccessible;
    pathFinder.finder = path.aStar(graph, {
        oriented,
        distance(fromNode, toNode, link) {
            return link.data.distance;
        },
    });

    const t1 = performance.now();
    console.debug(`WF. Graph created. ~ ${t1 - t0}ms.`);
}

function getLineByPoints(lines: RouteLine[], p0: RoutePoint, p1: RoutePoint): RouteLine {
    return lines.filter((l) => sameLine(l, p0, p1))[0];
}

export function getGraphLines(
    fromBooth: Booth,
    toBooth: Booth,
    exceptUnAccessible: boolean = false,
    disableCache: boolean = false
): RouteLine[] {
    let t0 = performance.now();

    const p1 = Polygon4.fromRect(fromBooth.rect).rotate(fromBooth.rotate, fromBooth.rect.cx, fromBooth.rect.cy);
    const p2 = Polygon4.fromRect(toBooth.rect).rotate(toBooth.rotate, toBooth.rect.cx, toBooth.rect.cy);

    const fromRect = new Rect(new Point(p1.x1, p1.y1), new Point(p1.x2, p1.y2), new Point(p1.x3, p1.y3), new Point(p1.x4, p1.y4));
    const toRect = new Rect(new Point(p2.x1, p2.y1), new Point(p2.x2, p2.y2), new Point(p2.x3, p2.y3), new Point(p2.x4, p2.y4));

    if (!pathFinder.finder || pathFinder.exceptUnAccessible !== exceptUnAccessible || disableCache)
        buildPathFinder(pathFinder.oriented, exceptUnAccessible);

    const from: RoutePoint[] = [];
    const to: RoutePoint[] = [];

    let { lines, lineEnds } = sublines();

    for (let i = 0; i < lineEnds.length; i++) {
        const lineEnd = lineEnds[i];

        const f = (lineEnd.layer === fromBooth.layer?.name || !fromBooth.layer) && pointInsideRectangle(lineEnd, fromRect);
        const t = (lineEnd.layer === toBooth.layer?.name || !toBooth.layer) && pointInsideRectangle(lineEnd, toRect);

        if (f) from.push(lineEnd);
        if (t) to.push(lineEnd);
    }

    const routePoints: RoutePoint[][] = [];

    for (let i = 0; i < from.length; i++) {
        for (let j = 0; j < to.length; j++) {
            try {
                const p = pathFinder.finder.find(pointId(from[i]), pointId(to[j]));
                if (p.length)
                    routePoints.push(
                        p.map(
                            (p) =>
                                new RoutePoint(p.id.split("_")[0], parseFloat(p.id.split("_")[1]), parseFloat(p.id.split("_")[2]))
                        )
                    );
            } catch (e) {
                console.warn(e);
            }
        }
    }

    if (!routePoints.length) {
        console.debug(`WF. Get graph lines: 0 ~ ${performance.now() - t0}ms.`);
        return [];
    }

    let _lines: RouteLine[] = [];
    var distances = [];

    for (let i = 0; i < routePoints.length; i++) {
        var d = 0;
        for (let j = 0; j < routePoints[i].length - 1; j++) d += lineLength(routePoints[i][j], routePoints[i][j + 1]);
        distances.push(d);
    }

    const points = routePoints[distances.indexOf(Math.min(...distances))];

    for (let i = 1; i < points.length; i++) {
        const pp = points[i - 1];
        const cp = points[i];

        let line = getLineByPoints(lines, pp, cp);

        let l = new RouteLine(pp, cp, line.unaccessible, line.unidirection, line.virtual, line.ended, line.weight);

        if (lineLength(line.p0, cp) < lineLength(line.p0, pp)) {
            l.p0 = pp;
            l.p1 = cp;
        }

        const prevLine = _lines[_lines.length - 1];
        const prevAngle = prevLine ? lineAngle(prevLine.p0, prevLine.p1) : null;
        const angle = lineAngle(l.p0, l.p1);

        if (!prevLine || prevLine.virtual !== l.virtual || Math.abs(angle - prevAngle) > 5) _lines.push(l);
        else prevLine.p1 = l.p1;
    }

    console.debug(`WF. Get graph lines: ${_lines.length} ~ ${performance.now() - t0}ms.`);
    return _lines;
}
