import Rect from "./core/Rect";
import store from "./store";
import { SpecialBooth } from "./store/BoothStore";
import { CurrentPosition } from "./store/RouteStore";
import { RouteLine, sublines } from "./utils/wayfinding";

export class RouteCutIn extends SpecialBooth {
    public readonly closestRoutePoint: CurrentPosition;

    constructor(
        public readonly name: string,
        public readonly point: CurrentPosition,
        public readonly id = Date.now(),
        public readonly rect: Rect = Rect.fromCxcywh(point.x, point.y, 1, 1),
        public readonly exhibitors = [],
    ) {
        super();

        this.layer = store.layerStore.findLayer(point.z);

        this.closestRoutePoint = {
            ...this.findClosestPointOnLine(point, this.findNearestRouteLine(point)),
            z: point.z,
        };

        if (this.closestRoutePoint) {
            this.rect = Rect.fromMultiple([
                this.rect,
                Rect.fromCxcywh(this.closestRoutePoint.x, this.closestRoutePoint.y, 1, 1),
            ]);
        }

        Object.freeze(this);
    }

    private findNearestRouteLine(point: CurrentPosition): RouteLine {
        const lines = sublines()?.lines || [];
        const levelLines = lines.filter((l) => l.p0.layer === point.z || l.p1.layer === point.z);
    
        let minDistance = Infinity;
        let closestLine: RouteLine = null;
    
        levelLines.forEach(line => {
            const distance = this.distanceToLine(point, line.p0, line.p1);
            if (distance < minDistance) {
                minDistance = distance;
                closestLine = line;
            }
        });
    
        return closestLine;
    }
    
    private distanceToLine(point: CurrentPosition, p0: Point, p1: Point): number {
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
    
    private findClosestPointOnLine(point: CurrentPosition, line: RouteLine): Point {
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
}