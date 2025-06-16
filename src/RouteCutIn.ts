import { SpecialBooth } from "./store/BoothStore";
import { RouteLine, sublines } from "./utils/wayfinding";
import rootStore from "./store";
import Rect from "./core/Rect";
import { areLayersEnabled } from "./utils/areLayersEnabled";

export class RouteCutIn extends SpecialBooth {
    protected readonly store = rootStore.boothStore;
    public readonly exhibitors = [];
    public readonly paths = [];
    public readonly routePoint: LayerPoint;
    public readonly rect: Rect = Rect.fromCxcywh(0, 0, 0, 0);
    public readonly entity = { type: "route-cut-in" } as const;

    constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly destination: LayerPoint,
        public readonly slug: string,
        public readonly meta = {},
    ) {
        super();

        this.layer = rootStore.layerStore.findLayer(destination.layer);

        this.routePoint = this.findClosestRoutePoint();

        const closestLineEnd = this.findClosestLineEnd(this.routePoint);
        if (closestLineEnd) {
            this.rect = Rect.fromCxcywh(closestLineEnd.x, closestLineEnd.y, 1, 1);
        }

        Object.freeze(this);
    }

    public getDestinationRect(): Rect {
        return Rect.fromCxcywh(this.destination.x, this.destination.y, 1, 1);
    }

    private findClosestRoutePoint(): LayerPoint {
        const lines = sublines()?.lines || [];
        const levelLines = (
            areLayersEnabled()
                ? lines.filter(
                    (l) => l.p0.layer === this.destination.layer && l.p1.layer === this.destination.layer
                )
                : lines
        );

        if (!levelLines?.length) {
            return null;
        }

        let minDistance = Infinity;
        let closestLine: RouteLine = null;
    
        levelLines.forEach(line => {
            const distance = this.distanceToLine(this.destination, line.p0, line.p1);
            if (distance < minDistance) {
                minDistance = distance;
                closestLine = line;
            }
        });

        return {
            ...this.findClosestPointOnLine(this.destination, closestLine),
            layer: this.destination.layer,
        };
    }

    private distanceToLine(point: LayerPoint, p0: Point, p1: Point): number {
        const x = point.x;
        const y = point.y;
        const x1 = p0.x;
        const y1 = p0.y;
        const x2 = p1.x;
        const y2 = p1.y;
    
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;
    
        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        if (len_sq !== 0) {
            param = dot / len_sq;
        }
    
        let xx, yy;
    
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
    
        const dx = x - xx;
        const dy = y - yy;

        return Math.sqrt(dx * dx + dy * dy);
    }
    
    private findClosestPointOnLine(point: LayerPoint, line: RouteLine): Point {
        const { x: x1, y: y1 } = line.p0;
        const { x: x2, y: y2 } = line.p1;
        const { x, y } = point;
    
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;
    
        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
    
        if (len_sq !== 0) {
            param = dot / len_sq;
        }
    
        let xx: number, yy: number;
    
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
    
        return { x: xx, y: yy };
    }

    private findClosestLineEnd(target: LayerPoint): LayerPoint {
        const lineEnds = (sublines()?.lineEnds || []);
        const levelLineEnds = (
            areLayersEnabled()
                ? lineEnds.filter(le => le.layer === target.layer)
                : lineEnds
        );

        let closestPoint = null;
        let minDistance = Infinity;

        function getDistance(x1, y1, x2, y2) {
            return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        }

        levelLineEnds.forEach(point => {
            const distance = getDistance(target.x, target.y, point.x, point.y);
            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = point;
            }
        });

        return closestPoint;
    }
}
