import Rect from "./Rect";

export default class Polygon4 {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    x3: number;
    y3: number;
    x4: number;
    y4: number;

    private constructor(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
        // vertexes are clockwise! 
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.x3 = x3;
        this.y3 = y3;
        this.x4 = x4;
        this.y4 = y4;
    }

    static fromRect(r: Rect) {
        return new Polygon4(r.x1, r.y1, r.x2, r.y1, r.x2, r.y2, r.x1, r.y2);
    }

    rotate(radians: number, cx: number, cy: number): Polygon4 {
        if (!radians) return this;
        const rx = Math.sin(radians);
        const ry = Math.cos(radians);

        function rotate(x, y) {
            const dx = x - cx;
            const dy = y - cy;
            const newDx = (dx * ry + dy * rx);
            const newDy = (dy * ry - dx * rx);
            x = cx + newDx;
            y = cy + newDy;
            return [x, y];
        }

        const [x1, y1] = rotate(this.x1, this.y1);
        const [x2, y2] = rotate(this.x2, this.y2);
        const [x3, y3] = rotate(this.x3, this.y3);
        const [x4, y4] = rotate(this.x4, this.y4);

        return new Polygon4(x1, y1, x2, y2, x3, y3, x4, y4);
    }

    toTriangles(): [Triangle, Triangle] {
        return [[[this.x1, this.y1], [this.x2, this.y2], [this.x4, this.y4]], [[this.x2, this.y2], [this.x4, this.y4], [this.x3, this.y3]]];
    }
}