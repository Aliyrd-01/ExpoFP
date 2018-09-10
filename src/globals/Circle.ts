export { }
namespace local {
    export class Circle {
        cx: number;
        r: number;
        cy: number;

        constructor(cx: number, cy: number, r: number) {
            this.cx = cx;
            this.cy = cy;
            this.r = r;
        }

        static fromSvgCircleElement(svgCircle: SVGCircleElement) {
            return new Circle(svgCircle.cx.baseVal.value, svgCircle.cy.baseVal.value, svgCircle.r.baseVal.value);
        }

        intersects(r: Rect): boolean {
            const x1 = this.cx - this.r/2;
            const x2 = this.cx + this.r/2;
            const y1 = this.cy - this.r/2;
            const y2 = this.cy + this.r/2;

            return (x2 >= r.x1 && x1 <= r.x2) && (y2 >= r.y1 && y1 <= r.y2);
        }
       
        // equals(r: Rect) {
        //     return r.cx === this.cx && r.r === this.r && r.cy === this.cy && r.y2 === this.y2;
        // }
    }

}

declare global {
    const Circle: typeof local.Circle;
    type Circle = local.Circle;
}

extendGlobal({ Circle: local.Circle })

