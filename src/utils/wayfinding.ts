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

export let sublines = (): Sublines => window["__wfData"];
let pathFinder = { finder: null, oriented: true, onlyAccessible: false };

function buildPathFinder(oriented: boolean, onlyAccessible: boolean) {
    const graph = createGraph();
    const t0 = performance.now();

    let { lines } = sublines();

    lines.forEach((line) => {
        if (!onlyAccessible || !line.unaccessible) {
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
    pathFinder.onlyAccessible = onlyAccessible;
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
    onlyAccessible: boolean = false,
    disableCache: boolean = false
): RouteLine[] {
    let t0 = performance.now();

    const p1 = Polygon4.fromRect(fromBooth.rect).rotate(fromBooth.rotate, fromBooth.rect.cx, fromBooth.rect.cy);
    const p2 = Polygon4.fromRect(toBooth.rect).rotate(toBooth.rotate, toBooth.rect.cx, toBooth.rect.cy);

    const fromRect = new Rect(new Point(p1.x1, p1.y1), new Point(p1.x2, p1.y2), new Point(p1.x3, p1.y3), new Point(p1.x4, p1.y4));
    const toRect = new Rect(new Point(p2.x1, p2.y1), new Point(p2.x2, p2.y2), new Point(p2.x3, p2.y3), new Point(p2.x4, p2.y4));

    if (!pathFinder.finder || pathFinder.onlyAccessible !== onlyAccessible || disableCache)
        buildPathFinder(pathFinder.oriented, onlyAccessible);

    // Every booth can contains many connection points
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

    const routePoints: { distance: number; points: RoutePoint[] }[] = [];

    for (let i = 0; i < from.length; i++) {
        for (let j = 0; j < to.length; j++) {
            try {
                const p = pathFinder.finder.find(pointId(from[i]), pointId(to[j]));
                if (!p.length) continue;

                let distance: number = 0;
                let points: RoutePoint[] = [];

                for (let i = 0; i < p.length; i++) {
                    const element = p[i];
                    const nextElement = p[i + 1];

                    const id = element.id;
                    const parts = id.split("_");
                    points.push(new RoutePoint(parts[0], parseFloat(parts[1]), parseFloat(parts[2])));

                    if (nextElement)
                        distance += element.links.find((l) => l.toId === id && l.fromId === nextElement.id).data.distance;
                }
                routePoints.push({ distance, points });
            } catch (e) {
                console.warn(e);
            }
        }
    }

    if (!routePoints.length) {
        console.debug(`WF. Get graph lines: 0 ~ ${performance.now() - t0}ms.`);
        return [];
    }

    const points = routePoints.sort((a, b) => a.distance - b.distance)[0].points;
    let _lines: RouteLine[] = [];

    for (let i = 1; i < points.length; i++) {
        const pp = points[i - 1];
        const cp = points[i];

        let line = getLineByPoints(lines, pp, cp);

        if (!line) continue;

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
