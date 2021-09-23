const path = require("ngraph.path");
const createGraph = require("ngraph.graph");

export class Point {
    constructor(public x: number, public y: number) {}
}

export class Line {
    constructor(public p0: Point, public p1: Point) {}
}

export class Rectangle {
    constructor(public p0: Point, public p1: Point, public p2: Point, public p3: Point) {}
}

const lineLength = (p1: Point, p2: Point): number => Math.round(Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)));

const linesIntersection = (line1: Line, line2: Line) => {
    const minDistanceLineEnds = (l1: Line, l2: Line) =>
        Math.min(lineLength(l1.p0, l2.p0), lineLength(l1.p0, l2.p1), lineLength(l1.p1, l2.p0), lineLength(l1.p1, l2.p1));

    let denominator: number,
        a: number,
        b: number,
        numerator1: number,
        numerator2: number,
        result = {
            point: new Point(null, null),
            onLine1: false,
            onLine2: false,
        };

    denominator = (line2.p1.y - line2.p0.y) * (line1.p1.x - line1.p0.x) - (line2.p1.x - line2.p0.x) * (line1.p1.y - line1.p0.y);
    if (denominator === 0) return result;

    a = line1.p0.y - line2.p0.y;
    b = line1.p0.x - line2.p0.x;
    numerator1 = (line2.p1.x - line2.p0.x) * a - (line2.p1.y - line2.p0.y) * b;
    numerator2 = (line1.p1.x - line1.p0.x) * a - (line1.p1.y - line1.p0.y) * b;
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    result.point.x = line1.p0.x + a * (line1.p1.x - line1.p0.x);
    result.point.y = line1.p0.y + a * (line1.p1.y - line1.p0.y);

    if (a >= 0 && a <= 1) result.onLine1 = true;
    if (b >= 0 && b <= 1) result.onLine2 = true;

    if ((!result.onLine1 || !result.onLine2) && minDistanceLineEnds(line1, line2) <= 2) result.onLine1 = result.onLine2 = true;

    return result;
};

const triangleArea = (p1: Point, p2: Point, p3: Point): number => {
    let a = 0.5 * (p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y));
    return Math.abs(a);
};

const pointInsideRectangle = (p: Point, rect: Rectangle): Point => {
    let rArea = lineLength(rect.p0, rect.p1) * lineLength(rect.p1, rect.p2);
    let sAreas =
        triangleArea(p, rect.p0, rect.p1) +
        triangleArea(p, rect.p1, rect.p2) +
        triangleArea(p, rect.p2, rect.p3) +
        triangleArea(p, rect.p3, rect.p0);

    return rArea >= sAreas ? p : null;
};

const lineRectangleIntersections = (line: Line, rect: Rectangle): Point[] => {
    let points: Point[] = [];

    let res = linesIntersection(line, { p0: rect.p0, p1: rect.p1 });
    if (res.onLine1 && res.onLine2) points.push({ x: res.point.x, y: res.point.y });

    res = linesIntersection(line, { p0: rect.p1, p1: rect.p2 });
    if (res.onLine1 && res.onLine2) points.push({ x: res.point.x, y: res.point.y });

    res = linesIntersection(line, { p0: rect.p2, p1: rect.p3 });
    if (res.onLine1 && res.onLine2) points.push({ x: res.point.x, y: res.point.y });

    res = linesIntersection(line, { p0: rect.p0, p1: rect.p3 });
    if (res.onLine1 && res.onLine2) points.push({ x: res.point.x, y: res.point.y });

    return points;
};

const lineCenter = (p1: Point, p2: Point): Point => new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);

const samePoint = (p1: Point, p2: Point): boolean => p1.x === p2.x && p1.y === p2.y;

const perpendicularToLine = (point: Point, start: Point, end: Point): { p: Point; isInside: boolean } => {
    const k =
        ((end.y - start.y) * (point.x - start.x) - (end.x - start.x) * (point.y - start.y)) /
        (Math.pow(end.y - start.y, 2) + Math.pow(end.x - start.x, 2));

    let p = new Point(point.x - k * (end.y - start.y), point.y + k * (end.x - start.x));

    return {
        p,
        isInside:
            p.x >= Math.min(start.x, end.x) &&
            p.x <= Math.max(start.x, end.x) &&
            p.y >= Math.min(start.y, end.y) &&
            p.y <= Math.max(start.y, end.y),
    };
};

export const buildWays = (lines: Line[], rects: Rectangle[], other: Rectangle[] = []): Line[] => {
    const blockers = rects.concat(other);

    let anyInter = blockers.filter((r) => lines.filter((l) => lineRectangleIntersections(l, r).length).length);
    if (anyInter.length) return null;

    const ways: Line[] = [];

    for (let i = 0; i < rects.length; i++) {
        const rect = rects[i];

        let perdendiculars: Line[] = [];

        let rectCenters = [
            lineCenter(rect.p0, rect.p1),
            lineCenter(rect.p1, rect.p2),
            lineCenter(rect.p2, rect.p3),
            lineCenter(rect.p3, rect.p0),
        ];

        for (let j = 0; j < rectCenters.length; j++) {
            const center = rectCenters[j];

            for (let k = 0; k < lines.length; k++) {
                const line = lines[k];

                let perpendicular = perpendicularToLine(center, line.p0, line.p1);
                if (!perpendicular.isInside) continue;

                let pLine = new Line(center, perpendicular.p);

                let rectIntersections = blockers.filter((r) => {
                    let p = lineRectangleIntersections(pLine, r);
                    return p.length > 0 && !(p.length === 1 && samePoint(center, p[0]));
                });

                let linesIntersections = lines.filter((l) => {
                    let r = linesIntersection(pLine, l);
                    return r.onLine1 && r.onLine2;
                });

                if (!rectIntersections.length && linesIntersections.length < 2) perdendiculars.push(pLine);
            }
        }

        ways.push(...perdendiculars);
    }
    return ways;
};

export const subLines = (lines: Line[]): { lines: Line[]; intersections: Point[]; lineEnds: Point[] } => {
    const subLines: Line[] = [];
    const intersections: Point[] = [];
    const lineEnds: Point[] = [];

    let linePoints: Point[] = [];

    for (let i = 0; i < lines.length; i++) {
        linePoints = [lines[i].p0, lines[i].p1];

        for (let j = 0; j < lines.length; j++) {
            if (i === j) continue;

            let intersect = linesIntersection(lines[i], lines[j]);
            if (!intersect.onLine1 || !intersect.onLine2) continue;
            linePoints.push(intersect.point);
            intersections.push(intersect.point);
        }

        linePoints = linePoints.sort((p0, p1) => lineLength(lines[i].p0, p0) - lineLength(lines[i].p0, p1));

        let points: Point[] = [];
        linePoints.forEach((point) => (!points.filter((p) => samePoint(point, p)).length ? points.push(point) : null));

        for (let k = 1; k < points.length; k++) subLines.push(new Line(points[k - 1], points[k]));
    }

    subLines.forEach((sl) => {
        if (!intersections.filter((i) => samePoint(sl.p0, i)).length) lineEnds.push(sl.p0);
        if (!intersections.filter((i) => samePoint(sl.p1, i)).length) lineEnds.push(sl.p1);
    });

    return { lines: subLines, intersections, lineEnds };
};

export const getWayPoints = (lines: Line[], fromRect: Rectangle, toRect: Rectangle): Point[] => {
    let nodes: { intersections: Point[] }[] = [];

    let startNodes: Point[] = [];
    let endNodes: Point[] = [];

    for (let i = 0; i < lines.length; i++) {
        nodes.push({ intersections: [] });

        let startIntersections = [
            pointInsideRectangle(lines[i].p0, fromRect),
            pointInsideRectangle(lines[i].p1, fromRect),
        ].filter((p) => p);

        let endIntersections = [pointInsideRectangle(lines[i].p0, toRect), pointInsideRectangle(lines[i].p1, toRect)].filter(
            (p) => p
        );

        startNodes.push(...startIntersections);
        endNodes.push(...endIntersections);

        nodes[nodes.length - 1].intersections.push(...startIntersections);
        nodes[nodes.length - 1].intersections.push(...endIntersections);

        for (let j = 0; j < lines.length; j++) {
            let result = linesIntersection(lines[i], lines[j]);
            if (result.onLine1 && result.onLine2) nodes[nodes.length - 1].intersections.push(result.point);
        }
    }

    let graph = createGraph();

    nodes
        .filter((n) => n.intersections.length > 1)
        .forEach((node) => {
            for (let i = 0; i < node.intersections.length; i++) {
                for (let j = 0; j < node.intersections.length; j++) {
                    if (i === j) continue;

                    graph.addLink(
                        `${node.intersections[i].x}_${node.intersections[i].y}`,
                        `${node.intersections[j].x}_${node.intersections[j].y}`,
                        { distance: lineLength(node.intersections[i], node.intersections[j]) }
                    );
                }
            }
        });

    let pathFinder = path.aStar(graph, {
        distance(fromNode, toNode, link) {
            return link.data.distance;
        },
    });

    let paths: Point[][] = [];

    for (let i = 0; i < startNodes.length; i++) {
        for (let j = 0; j < endNodes.length; j++) {
            try {
                let p = pathFinder.find(`${startNodes[i].x}_${startNodes[i].y}`, `${endNodes[j].x}_${endNodes[j].y}`);
                if (p.length) paths.push(p.map((p) => new Point(parseFloat(p.id.split("_")[0]), parseFloat(p.id.split("_")[1]))));
            } catch {}
        }
    }

    if (!paths.length) return [];

    var distances = [];

    for (let i = 0; i < paths.length; i++) {
        const points: Point[] = paths[i];

        var d = 0;
        for (let j = 0; j < points.length - 1; j++) d += lineLength(points[j], points[j + 1]);

        distances.push(d);
    }

    return paths[distances.indexOf(Math.min(...distances))];
};
