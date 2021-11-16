const path = require("ngraph.path");
const createGraph = require("ngraph.graph");

export class Point {
    constructor(public x: number, public y: number) {
        this.x = round(this.x);
        this.y = round(this.y);
    }
}

export class Line {
    constructor(
        public p0: Point,
        public p1: Point,
        public unaccessible: boolean = false,
        public unidirection: boolean = false,
        public virtual: boolean = false,
        public ended: boolean = false
    ) {}
}

export class Rectangle {
    constructor(public p0: Point, public p1: Point, public p2: Point, public p3: Point) {}

    public static fromWH(x: number, y: number, width: number, height: number): Rectangle {
        return new Rectangle(
            new Point(x, y),
            new Point(x + width, y),
            new Point(x + width, y + height),
            new Point(x, y + height)
        );
    }
}

export type Sublines = { lines: Line[]; intersections: Point[]; lineEnds: Point[] };

export const lineCenter = (p1: Point, p2: Point): Point => new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);

export const lineId = (p0: Point, p1: Point): string =>
    `${p0.x.toFixed(0)}_${p0.y.toFixed(0)}_${p1.x.toFixed(0)}_${p1.y.toFixed(0)}`;

export const pointId = (p: Point): string => `${p.x.toFixed(0)}_${p.y.toFixed(0)}`;

export const lineLength = (p1: Point, p2: Point): number => round(Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)));

export const lineAngle = (startPoint: Point, endPoint: Point): number => {
    const p1 = new Point(startPoint.x + 100000, startPoint.y);

    const a = lineLength(p1, startPoint);
    const b = lineLength(endPoint, startPoint);
    const c = lineLength(p1, endPoint);
    const cos = (Math.pow(a, 2) + Math.pow(b, 2) - Math.pow(c, 2)) / (2 * a * b);

    const direction = getDirection(startPoint, p1, endPoint);

    return direction * round((Math.acos(cos > 1 ? 1 : cos) * 180) / Math.PI);
};

const round = (number: number, digits: number = 3) => Math.round(number * Math.pow(10, digits)) / Math.pow(10, digits);

const samePoint = (p1: Point, p2: Point): boolean => lineLength(p1, p2) < 0.1;

export const sameLine = (l1: Line, l2: Line): boolean =>
    (samePoint(l1.p0, l2.p0) && samePoint(l1.p1, l2.p1)) || (samePoint(l1.p0, l2.p1) && samePoint(l1.p1, l2.p0));

const getDirection = (centerPoint: Point, startPoint: Point, endPoint: Point): number => {
    return (startPoint.x - centerPoint.x) * (endPoint.y - centerPoint.y) -
        (startPoint.y - centerPoint.y) * (endPoint.x - centerPoint.x) <
        0
        ? -1
        : 1;
};

const minDistanceLineEnds = (l1: Line, p: Point) => Math.min(lineLength(l1.p0, p), lineLength(l1.p1, p));

const triangleArea = (p1: Point, p2: Point, p3: Point): number =>
    Math.abs(0.5 * (p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)));

const linesIntersection = (line1: Line, line2: Line) => {
    let denominator: number,
        a: number,
        b: number,
        numerator1: number,
        numerator2: number,
        result = {
            point: null,
            onLine1: false,
            onLine2: false,
        };

    denominator = (line2.p1.y - line2.p0.y) * (line1.p1.x - line1.p0.x) - (line2.p1.x - line2.p0.x) * (line1.p1.y - line1.p0.y);
    if (denominator === 0) return result;

    a = line1.p0.y - line2.p0.y;
    b = line1.p0.x - line2.p0.x;
    numerator1 = (line2.p1.x - line2.p0.x) * a - (line2.p1.y - line2.p0.y) * b;
    numerator2 = (line1.p1.x - line1.p0.x) * a - (line1.p1.y - line1.p0.y) * b;
    a = round(numerator1 / denominator, 6);
    b = round(numerator2 / denominator, 6);

    result.point = new Point(line1.p0.x + a * (line1.p1.x - line1.p0.x), line1.p0.y + a * (line1.p1.y - line1.p0.y));

    if (a >= 0 && a <= 1) result.onLine1 = true;
    if (b >= 0 && b <= 1) result.onLine2 = true;

    if (
        (!result.onLine1 || !result.onLine2) &&
        ((result.onLine1 && minDistanceLineEnds(line2, result.point) <= 0.1) ||
            (result.onLine2 && minDistanceLineEnds(line1, result.point) <= 0.1))
    )
        result.onLine1 = result.onLine2 = true;

    return result;
};

const pointInsideRectangle = (p: Point, rect: Rectangle): Point => {
    const rArea = lineLength(rect.p0, rect.p1) * lineLength(rect.p1, rect.p2);
    const sAreas =
        triangleArea(p, rect.p0, rect.p1) +
        triangleArea(p, rect.p1, rect.p2) +
        triangleArea(p, rect.p2, rect.p3) +
        triangleArea(p, rect.p3, rect.p0);

    return Math.abs(rArea - sAreas) < rArea * 0.01 ? p : null;
};

const lineRectangleIntersections = (line: Line, rect: Rectangle): Point[] => {
    const points: Point[] = [];

    let res = linesIntersection(line, new Line(rect.p0, rect.p1));
    if (res.onLine1 && res.onLine2) points.push(new Point(res.point.x, res.point.y));

    res = linesIntersection(line, new Line(rect.p1, rect.p2));
    if (res.onLine1 && res.onLine2) points.push(new Point(res.point.x, res.point.y));

    res = linesIntersection(line, new Line(rect.p2, rect.p3));
    if (res.onLine1 && res.onLine2) points.push(new Point(res.point.x, res.point.y));

    res = linesIntersection(line, new Line(rect.p0, rect.p3));
    if (res.onLine1 && res.onLine2) points.push(new Point(res.point.x, res.point.y));

    return points;
};

const buildPerpendiculars = (lines: Line[], rects: Rectangle[], other: Rectangle[], maxLength: number): Line[] => {
    const blockers = rects.concat(other);

    lines = lines.filter((l) => !l.virtual);

    const perpendiculars: Line[] = [];

    for (let i = 0; i < rects.length; i++) {
        const rect = rects[i];

        if (lines.filter((l) => lineRectangleIntersections(l, rect).length).length) continue;

        const line_13 = new Line(lineCenter(rect.p0, rect.p1), lineCenter(rect.p2, rect.p3));
        const line_24 = new Line(lineCenter(rect.p1, rect.p2), lineCenter(rect.p3, rect.p0));

        let minLengths: number[] = [10000000, 10000000, 10000000, 10000000];
        let minLlines: Point[] = [null, null, null, null];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            const inter_13 = linesIntersection(line_13, line);
            if (inter_13.onLine2) {
                const l1 = lineLength(line_13.p0, inter_13.point);
                const l3 = lineLength(line_13.p1, inter_13.point);

                if (l1 && l1 < l3 && l1 < minLengths[0] && l1 < maxLength) {
                    minLengths[0] = l1;
                    minLlines[0] = inter_13.point;
                } else if (l3 && l3 < l1 && l3 < minLengths[2] && l3 < maxLength) {
                    minLengths[2] = l3;
                    minLlines[2] = inter_13.point;
                }
            }

            const inter_24 = linesIntersection(line_24, line);
            if (inter_24.onLine2) {
                const l2 = lineLength(line_24.p0, inter_24.point);
                const l4 = lineLength(line_24.p1, inter_24.point);

                if (l2 && l2 < l4 && l2 < minLengths[1] && l2 < maxLength) {
                    minLengths[1] = l2;
                    minLlines[1] = inter_24.point;
                } else if (l4 && l4 < l2 && l4 < minLengths[3] && l4 < maxLength) {
                    minLengths[3] = l4;
                    minLlines[3] = inter_24.point;
                }
            }
        }

        if (minLlines[0]) {
            const l = new Line(line_13.p0, minLlines[0]);
            if (!blockers.find((b) => b !== rect && lineRectangleIntersections(l, b).length > 0)) perpendiculars.push(l);
        }
        if (minLlines[2]) {
            const l = new Line(line_13.p1, minLlines[2]);
            if (!blockers.find((b) => b !== rect && lineRectangleIntersections(l, b).length > 0)) perpendiculars.push(l);
        }
        if (minLlines[1]) {
            const l = new Line(line_24.p0, minLlines[1]);
            if (!blockers.find((b) => b !== rect && lineRectangleIntersections(l, b).length > 0)) perpendiculars.push(l);
        }
        if (minLlines[3]) {
            const l = new Line(line_24.p1, minLlines[3]);
            if (!blockers.find((b) => b !== rect && lineRectangleIntersections(l, b).length > 0)) perpendiculars.push(l);
        }
    }

    perpendiculars.forEach((p) => (p.ended = true));

    return perpendiculars;
};

// Возвращаем true если пересечени корректное
const checkVirtualIntersection = (line1: Line, line2: Line, intersection: any) => {
    if (!line1.virtual && !line2.virtual) return true;
    if ((line1.ended && line2.virtual) || (line1.virtual && line2.ended)) return false;
    if (line1.virtual && (samePoint(line1.p0, intersection) || samePoint(line1.p1, intersection))) return true;
    if (line2.virtual && (samePoint(line2.p0, intersection) || samePoint(line2.p1, intersection))) return true;

    return false;
};

const subLines = (lines: Line[]): Sublines => {
    const subLines: Line[] = [];
    const intersections: Point[] = [];
    const lineEnds: Point[] = [];

    let linePoints: Point[] = [];

    for (let i = 0; i < lines.length; i++) {
        linePoints = [lines[i].p0, lines[i].p1];

        for (let j = 0; j < lines.length; j++) {
            if (i === j) continue;

            const intersect = linesIntersection(lines[i], lines[j]);
            if (!intersect.onLine1 || !intersect.onLine2 || !checkVirtualIntersection(lines[i], lines[j], intersect.point))
                continue;
            linePoints.push(intersect.point);
            if (!intersections.filter((i) => samePoint(i, intersect.point)).length) intersections.push(intersect.point);
        }

        linePoints = linePoints.sort((p0, p1) => lineLength(lines[i].p0, p0) - lineLength(lines[i].p0, p1));

        const points: Point[] = [];
        linePoints.forEach((point) => (!points.filter((p) => samePoint(point, p)).length ? points.push(point) : null));

        for (let k = 1; k < points.length; k++)
            subLines.push(new Line(points[k - 1], points[k], lines[i].unaccessible, lines[i].unidirection, lines[i].virtual));
    }

    subLines.forEach((sl) => {
        if (!intersections.filter((i) => samePoint(sl.p0, i)).length) lineEnds.push(sl.p0);
        if (!intersections.filter((i) => samePoint(sl.p1, i)).length) lineEnds.push(sl.p1);
    });

    return { lines: subLines, intersections, lineEnds };
};

let sublines: Sublines = null;
let pathFinder = { finder: null, oriented: false, exceptUnAccessible: false };

const buildPathFinder = (oriented: boolean, exceptUnAccessible: boolean) => {
    const graph = createGraph();
    const t0 = performance.now();

    sublines.intersections.forEach((intersect) => {
        sublines.lines.forEach((line) => {
            if ((samePoint(line.p0, intersect) || samePoint(line.p1, intersect)) && (!exceptUnAccessible || !line.unaccessible)) {
                graph.addLink(pointId(line.p0), pointId(line.p1), {
                    distance: lineLength(line.p0, line.p1),
                });

                if (oriented && !line.unidirection)
                    graph.addLink(pointId(line.p1), pointId(line.p0), {
                        distance: lineLength(line.p1, line.p0),
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
};

export const buildGraph = (lines: Line[], rects: Rectangle[], other: Rectangle[], maxLength: number): Sublines => {
    if (window["__wfData"]) sublines = window["__wfData"];
    else {
        let t0 = performance.now();
        const perpendiculars = buildPerpendiculars(lines, rects, other, maxLength);
        let t1 = performance.now();

        console.debug(`WF. Perpendiculars created: ${perpendiculars.length} ~ ${t1 - t0}ms.`);

        t0 = performance.now();
        sublines = subLines(lines.concat(perpendiculars));
        t1 = performance.now();

        console.debug(
            `WF. Sublines created. Lines: ${sublines.lines.length}, intersections: ${sublines.intersections.length}, lineEnds: ${
                sublines.lineEnds.length
            }} ~ ${t1 - t0}ms.`
        );
    }

    return sublines;
};

export const getGraphPoints = (fromRect: Rectangle, toRect: Rectangle, exceptUnAccessible: boolean = false): Point[] => {
    if (!pathFinder.finder || pathFinder.exceptUnAccessible !== exceptUnAccessible)
        buildPathFinder(pathFinder.oriented, exceptUnAccessible);

    const from: Point[] = [];
    const to: Point[] = [];

    for (let i = 0; i < sublines.lineEnds.length; i++) {
        const line = sublines.lineEnds[i];

        const f = pointInsideRectangle(line, fromRect);
        const t = pointInsideRectangle(line, toRect);

        if (f) from.push(f);
        if (t) to.push(t);
    }

    const paths: Point[][] = [];

    for (let i = 0; i < from.length; i++) {
        for (let j = 0; j < to.length; j++) {
            try {
                const p = pathFinder.finder.find(pointId(from[i]), pointId(to[j]));
                if (p.length) paths.push(p.map((p) => new Point(parseFloat(p.id.split("_")[0]), parseFloat(p.id.split("_")[1]))));
            } catch (e) {
                console.warn(e);
            }
        }
    }

    if (!paths.length) return [];

    var distances = [];

    for (let i = 0; i < paths.length; i++) {
        var d = 0;
        for (let j = 0; j < paths[i].length - 1; j++) d += lineLength(paths[i][j], paths[i][j + 1]);
        distances.push(d);
    }

    return paths[distances.indexOf(Math.min(...distances))];
};
