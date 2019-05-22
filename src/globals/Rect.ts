// import extendGlobal from '@/utils/extend-global'
export { }
namespace local {
    export class Rect {
        x1: number;
        x2: number;
        y1: number;
        y2: number;

        get h() { return Math.abs(this.y2 - this.y1); }
        get w() { return Math.abs(this.x2 - this.x1); }
        get cx() { return (this.x1 + this.x2) / 2; }
        get cy() { return (this.y1 + this.y2) / 2; }

        private constructor(x1: number, y1: number, x2: number, y2: number) {
            if (x1 > x2) {
                const x1Orig = x1;
                x1 = x2;
                x2 = x1Orig;
            }
            if (y1 > y2) {
                const y1Orig = y1;
                y1 = y2;
                y2 = y1Orig;
            }
            if (x1 >= x2 || y1 >= y2) {
                throw new Error('Invalid rect');
            }
            this.x1 = x1;
            this.y1 = y1;
            this.x2 = x2;
            this.y2 = y2;
        }

        static fromX1y1x2y2(x1: number, y1: number, x2: number, y2: number) {
            return new Rect(x1, y1, x2, y2);
        }

        static fromXywh(x: number, y: number, w: number, h: number) {
            return this.fromX1y1x2y2(x, y, x + w, y + h);
        }

        static fromCxcywh(cx: number, cy: number, w: number, h: number) {
            return this.fromX1y1x2y2(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2);
        }

        static fromXywhRect(rect: { x: number, y: number, w: number, h: number }) {
            return this.fromX1y1x2y2(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
        }

        static fromSvgRectElement(svgRect: SVGRectElement) {
            // let x = svgRect.x.baseVal.value;
            // let y = svgRect.y.baseVal.value;
            // let w = svgRect.width.baseVal.value;
            // let h = svgRect.height.baseVal.value;
            // if (w < 0) { x += w; w = -w; }
            // if (h < 0) { y += h; h = -h; }
            return this.fromXywh(svgRect.x.baseVal.value, svgRect.y.baseVal.value, svgRect.width.baseVal.value, svgRect.height.baseVal.value);
        }

        static fromMultiple(rects: Rect[]) {
            return Rect.fromX1y1x2y2(
                Math.min(...rects.map(x => x.x1)),
                Math.min(...rects.map(x => x.y1)),
                Math.max(...rects.map(x => x.x2)),
                Math.max(...rects.map(x => x.y2))
            );
        }

        contains(r: Rect): boolean {
            return r.x1 >= this.x1 && r.x2 <= this.x2 && r.y1 >= this.y1 && r.y2 <= this.y2;
        }

        intersects(r: Rect): boolean {
            const x1 = Math.max(this.x1, r.x1);
            const x2 = Math.min(this.x2, r.x2);
            const y1 = Math.max(this.y1, r.y1);
            const y2 = Math.min(this.y2, r.y2);
            return x2 >= x1 && y2 >= y1;
        }

        getIntersection(r: Rect): Rect {
            const x1 = Math.max(this.x1, r.x1);
            const x2 = Math.min(this.x2, r.x2);
            const y1 = Math.max(this.y1, r.y1);
            const y2 = Math.min(this.y2, r.y2);
            if (x2 >= x1 && y2 >= y1) {
                return Rect.fromX1y1x2y2(x1, y1, x2, y2);
            }
            else
                return Rect.fromX1y1x2y2(0, 0, 0, 0);
        }

        normalize(width: number, height: number) {
            const x1 = this.x1 / width;
            const x2 = this.x2 / width;
            const y1 = this.y1 / height;
            const y2 = this.y2 / height;
            return Rect.fromX1y1x2y2(x1, y1, x2, y2);
        }

        withPadding(x: number, y: number = x) {
            if (this.w < x * 2 || this.h < y * 2) return null;
            return Rect.fromCxcywh(this.cx, this.cy, this.w - x * 2, this.h - y * 2);
        }

        scale(s: number) {
            return Rect.fromX1y1x2y2(this.x1 * s, this.y1 * s, this.x2 * s, this.y2 * s)
        }

        getArea() {
            return this.w * this.h;
        }

        clone() {
            return new Rect(this.x1, this.y1, this.x2, this.y2);
        }

        translate(dx: number, dy: number) {
            this.x1 += dx;
            this.x2 += dx;
            this.y1 += dy;
            this.y2 += dy;

            return this;
        }

        equals(r: Rect) {
            return r.x1 === this.x1 && r.x2 === this.x2 && r.y1 === this.y1 && r.y2 === this.y2;
        }

        toString() {
            return this.x1 + ',' + this.y1 + ',' + this.w + ',' + this.h;
        }

        containsPoint(x: number, y: number) {
            return x >= this.x1 && x <= this.x2 && y >= this.y1 && y <= this.y2;
        }

        // rotate(radians): Polygon4 {
        //     const cx = this.cx;
        //     const cy = this.cy;
        //     const rx = Math.sin(radians);
        //     const ry = Math.cos(radians);

        //     function rotateX(x) {
        //         return x;
        //     }

        //     const x1 = rotateX(this.x1);
        //     const x2 = rotateX(this.x1);
        // }
    }

    export class Polygon4 {
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
}


declare global {
    const Rect: typeof local.Rect;
    type Rect = local.Rect;
    const Polygon4: typeof local.Polygon4;
    type Polygon4 = local.Polygon4;
}

extendGlobal({ Rect: local.Rect, Polygon4: local.Polygon4 })

