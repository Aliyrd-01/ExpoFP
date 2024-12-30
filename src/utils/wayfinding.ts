import { lineAngle, lineLength, Point, pointInsideRectangle, Rect } from "simple-geometry";
import Polygon4 from "../core/Polygon";
import { Booth } from "../store/BoothStore";
import aStarPathSearch from "./a-star/a-star";
import createGraph from "ngraph.graph";

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

interface RouteSegment {
    distance: number;
    points: RoutePoint[];
}

type Sublines = { lines: RouteLine[]; lineEnds: RoutePoint[] };

const pointId = (p: RoutePoint): string => `${p.layer}_${p.x}_${p.y}`;

const samePoint = (p1: RoutePoint, p2: RoutePoint): boolean => p1.layer === p2.layer && lineLength(p1, p2) <= 1;

const sameLine = (l: RouteLine, p0: RoutePoint, p1: RoutePoint): boolean =>
    (samePoint(l.p0, p0) && samePoint(l.p1, p1) && l.p0.layer === p0.layer && l.p1.layer === p1.layer) ||
    (samePoint(l.p0, p1) && samePoint(l.p1, p0) && l.p0.layer === p1.layer && l.p1.layer === p0.layer);

function parseId(id: string): [string, number, number] {
    const parts = id.split("_");
    return [parts[0], parseFloat(parts[1]), parseFloat(parts[2])];
}

export let sublines = (): Sublines => window["__wfData"];
let pathFinder = { finder: null, oriented: true, onlyAccessible: false };


function buildPathFinder(oriented: boolean, onlyAccessible: boolean, noVirtuals: boolean = false) {
    const graph = createGraph();
    const t0 = performance.now();

    let { lines } = sublines();

    lines.forEach((line) => {
        if (!onlyAccessible || !line.unaccessible) {
            graph.addLink(pointId(line.p0), pointId(line.p1), {
                distance: line.virtual ? (noVirtuals ? Number.MAX_VALUE : 0) : lineLength(line.p0, line.p1) / (line.weight || 4),
            });

            if (oriented && !line.unidirection)
                graph.addLink(pointId(line.p1), pointId(line.p0), {
                    distance: line.virtual
                        ? noVirtuals
                            ? Number.MAX_VALUE
                            : 0
                        : lineLength(line.p1, line.p0) / (line.weight || 4),
                });
        }
    });

    pathFinder.oriented = oriented;
    pathFinder.onlyAccessible = onlyAccessible;
    pathFinder.finder = aStarPathSearch(graph, {
        oriented,
        distance(fromNode, toNode, link) {
            var coef = 1;

            if (toNode.parent) {
                const parentP = parseId(toNode.parent?.node.id);
                const toP = parseId(toNode.node.id);
                const fromP = parseId(fromNode.id);

                var ang1 = lineAngle({ x: parentP[1], y: parentP[2] }, { x: toP[1], y: toP[2] });
                var ang2 = lineAngle({ x: toP[1], y: toP[2] }, { x: fromP[1], y: fromP[2] });

                if (ang1 !== ang2) coef = 1.01;
            }

            return coef * link.data.distance;
        },
    });

    const t1 = performance.now();
    console.debug(`WF. Graph created. ~ ${t1 - t0}ms.`);
}

function getLineByPoints(lines: RouteLine[], p0: RoutePoint, p1: RoutePoint): RouteLine {
    return lines.filter((l) => sameLine(l, p0, p1))[0];
}

export function getGraphLines(fromBooth: Booth, toBooth: Booth, onlyAccessible: boolean = false, waypoints: Booth[] = []): RouteLine[] {
    let t0 = performance.now();

    const p1 = Polygon4.fromRect(fromBooth.rect).rotate(fromBooth.rotate, fromBooth.rect.cx, fromBooth.rect.cy);
    const p2 = Polygon4.fromRect(toBooth.rect).rotate(toBooth.rotate, toBooth.rect.cx, toBooth.rect.cy);

    const fromRect = new Rect(new Point(p1.x1, p1.y1), new Point(p1.x2, p1.y2), new Point(p1.x3, p1.y3), new Point(p1.x4, p1.y4));
    const toRect = new Rect(new Point(p2.x1, p2.y1), new Point(p2.x2, p2.y2), new Point(p2.x3, p2.y3), new Point(p2.x4, p2.y4));

    const waypointsRectsById = new Map(waypoints.map((w) => {
        const p = Polygon4.fromRect(w.rect).rotate(w.rotate, w.rect.cx, w.rect.cy);
        return [
            w.id,
            new Rect(
                new Point(p.x1, p.y1),
                new Point(p.x2, p.y2),
                new Point(p.x3, p.y3),
                new Point(p.x4, p.y4),
            ),
        ];
    }));

    if (!pathFinder.finder || pathFinder.onlyAccessible !== onlyAccessible) buildPathFinder(pathFinder.oriented, onlyAccessible);

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

    const routePoints: RouteSegment[] = [];
    const pointsArr: RoutePoint[][] = [
        from,
        ...waypoints.reduce<RoutePoint[][]>((acc, wp) => {
            const rect = waypointsRectsById.get(wp.id);
            if (rect) {
                const filteredPoints = lineEnds.filter(
                    (lineEnd) =>
                        (lineEnd.layer === wp.layer?.name || !wp.layer) &&
                        pointInsideRectangle(lineEnd, rect)
                );
                if (filteredPoints.length > 0) {
                    acc.push(filteredPoints);
                }
            }
            return acc;
        }, []),
        to,
    ];

    routePoints.push(
        ...pointsArr
            .slice(1)
            .map((point, i) => findRoutePoints(pointsArr[i], point))
            .reverse()
            .flat()
    );

    if (!routePoints.length) {
        console.debug(`WF. Get graph lines: 0 ~ ${performance.now() - t0}ms.`);
        return [];
    }

    const _lines: RouteLine[] = filterCollinearAndContainedLines(
        routePoints.flatMap(rp => createRouteLines(rp.points, lines)).reverse()
    ).reverse();

    console.debug(`WF. Get graph lines: ${_lines.length} ~ ${performance.now() - t0}ms.`);
    return _lines;
}

function findRoutePoints(from: RoutePoint[], to: RoutePoint[]): RouteSegment[] {
    const routePoints: RouteSegment[] = [];

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
                    const parts = parseId(id);
                    points.push(new RoutePoint(parts[0], parts[1], parts[2]));

                    if (nextElement)
                        distance += element.links.find((l) => l.toId === id && l.fromId === nextElement.id).data.distance;
                }
                routePoints.push({ distance, points });
            } catch (e) {
                console.warn(e);
            }
        }
    }

    return routePoints.sort((a, b) => a.distance - b.distance).slice(0, 1);
}

function createRouteLines(points: RoutePoint[], lines: RouteLine[]): RouteLine[] {
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

    return _lines;
}

export class DistanceOptimizedRoute {
    private readonly rectMap: Map<string, { cx: number; cy: number }>;
    public readonly waypoints: string[];

    constructor(
        data: [string, { cx: number; cy: number }][],
        private distanceMetric: (
            x1: number,
            y1: number,
            x2: number,
            y2: number
        ) => number = DistanceOptimizedRoute.defaultManhattanDistance
    ) {
        this.rectMap = new Map(data);
        this.waypoints = this.getSortedByDistance(Array.from(this.rectMap.keys()));
        this.rectMap.clear();
        Object.freeze(this);
    }

    private static defaultManhattanDistance(
        x1: number,
        y1: number,
        x2: number,
        y2: number
    ): number {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    private getSortedByDistance(waypoints: readonly string[]): string[] {
        if (!waypoints.length) return [];

        const uniqueWaypoints = Array.from(new Set(waypoints));
        const from = this.rectMap.get(uniqueWaypoints[0]);
        if (!from) return [];

        uniqueWaypoints.sort((a, b) => {
            const rectA = this.rectMap.get(a);
            const rectB = this.rectMap.get(b);

            if (!rectA || !rectB) return 0;

            const distanceA = this.distanceMetric(
                from.cx,
                from.cy,
                rectA.cx,
                rectA.cy
            );
            const distanceB = this.distanceMetric(
                from.cx,
                from.cy,
                rectB.cx,
                rectB.cy
            );

            return distanceA - distanceB;
        });

        return uniqueWaypoints;
    }
}

function filterCollinearAndContainedLines(lines: RouteLine[]): RouteLine[] {
    const filtered: RouteLine[] = [];

    for (const line of lines) {
        // Check if the current line is contained within any line in the filtered list
        let isContained = false;
        for (const existingLine of filtered) {
            const { p0: p1Start, p1: p1End } = line;
            const { p0: p2Start, p1: p2End } = existingLine;

            if (isPointOnLine(p1Start, p2Start, p2End) && isPointOnLine(p1End, p2Start, p2End)) {
                isContained = true;
                break;
            }
        }

        if (!isContained) {
            filtered.push(line);
        }
    }

    return filtered;
}

// Check if a point lies on a line segment defined by two endpoints
function isPointOnLine(point: { x: number; y: number }, lineStart: { x: number; y: number }, lineEnd: { x: number; y: number }): boolean {
    // Check if the point is collinear using the cross product
    const crossProduct = (lineEnd.x - lineStart.x) * (point.y - lineStart.y) - (lineEnd.y - lineStart.y) * (point.x - lineStart.x);
    if (Math.abs(crossProduct) > 1e-10) return false;

    // Check if the point lies within the bounds of the line segment
    const withinX = Math.min(lineStart.x, lineEnd.x) <= point.x && point.x <= Math.max(lineStart.x, lineEnd.x);
    const withinY = Math.min(lineStart.y, lineEnd.y) <= point.y && point.y <= Math.max(lineStart.y, lineEnd.y);

    return withinX && withinY;
}
