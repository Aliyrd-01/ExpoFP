import { Line, lineAngle, lineLength, Point, pointInsideRectangle, Rect } from "simple-geometry";

const path = require("ngraph.path");
const createGraph = require("ngraph.graph");

export class RouteLine extends Line {
    constructor(
        public p0: Point,
        public p1: Point,
        public layer: string,
        public unaccessible: boolean,
        public unidirection: boolean,
        public virtual: boolean,
        public ended: boolean,
        public weight: number
    ) {
        super(p0, p1);
    }
}

type Sublines = { lines: RouteLine[]; intersections: Point[]; lineEnds: Point[] };

const pointId = (p: Point): string => `${p.x.toFixed(0)}_${p.y.toFixed(0)}`;

const samePoint = (p1: Point, p2: Point): boolean => lineLength(p1, p2) <= 1;

const sameLine = (l1: Line, l2: Line): boolean =>
    (samePoint(l1.p0, l2.p0) && samePoint(l1.p1, l2.p1)) || (samePoint(l1.p0, l2.p1) && samePoint(l1.p1, l2.p0));

let sublines = (): Sublines => window["__wfData"];
let pathFinder = { finder: null, oriented: true, exceptUnAccessible: false };

function buildPathFinder(oriented: boolean, exceptUnAccessible: boolean, virtualIsZero: boolean) {
    const graph = createGraph();
    const t0 = performance.now();

    let { intersections, lines } = sublines();

    intersections.forEach((intersect) => {
        lines.forEach((line) => {
            if ((samePoint(line.p0, intersect) || samePoint(line.p1, intersect)) && (!exceptUnAccessible || !line.unaccessible)) {
                graph.addLink(pointId(line.p0), pointId(line.p1), {
                    distance: virtualIsZero && line.virtual ? 0 : lineLength(line.p0, line.p1) / (line.weight || 4),
                });

                if (oriented && !line.unidirection)
                    graph.addLink(pointId(line.p1), pointId(line.p0), {
                        distance: virtualIsZero && line.virtual ? 0 : lineLength(line.p1, line.p0) / (line.weight || 4),
                    });
            }
        });
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

function getLineByPoints(lines: RouteLine[], p0: Point, p1: Point): RouteLine {
    return lines.filter((l) => sameLine(l, { p0, p1 }))[0];
}

export function getGraphLines(
    fromRect: Rect,
    toRect: Rect,
    exceptUnAccessible: boolean = false,
    disableCache: boolean = false,
    virtualIsZero: boolean
): RouteLine[] {
    let t0 = performance.now();

    if (!pathFinder.finder || pathFinder.exceptUnAccessible !== exceptUnAccessible || disableCache)
        buildPathFinder(pathFinder.oriented, exceptUnAccessible, virtualIsZero);

    const from: Point[] = [];
    const to: Point[] = [];

    let { lines, lineEnds } = sublines();

    for (let i = 0; i < lineEnds.length; i++) {
        const line = lineEnds[i];

        const f = pointInsideRectangle(line, fromRect);
        const t = pointInsideRectangle(line, toRect);

        if (f) from.push(f);
        if (t) to.push(t);
    }

    const routePoints: Point[][] = [];

    for (let i = 0; i < from.length; i++) {
        for (let j = 0; j < to.length; j++) {
            try {
                const p = pathFinder.finder.find(pointId(from[i]), pointId(to[j]));
                if (p.length)
                    routePoints.push(p.map((p) => new Point(parseFloat(p.id.split("_")[0]), parseFloat(p.id.split("_")[1]))));
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

        let l = new RouteLine(pp, cp, line.layer, line.unaccessible, line.unidirection, line.virtual, line.ended, line.weight);

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
