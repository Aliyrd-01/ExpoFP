export {}
// export default class Line {
//     x1: number;
//     x2: number;
//     y1: number;
//     y2: number;


//     constructor(x1: number, y1: number, x2: number, y2: number) {
//         this.x1 = x1;
//         this.y1 = y1;
//         this.x2 = x2;
//         this.y2 = y2;
//     }

//     // static fromX1y1x2y2(x1: number, y1: number, x2: number, y2: number) {
//     //     return new Line(x1, y1, x2, y2);
//     // }

//     // static fromXywh(x: number, y: number, w: number, h: number) {
//     //     return this.fromX1y1x2y2(x, y, x + w, y + h);
//     // }

//     // static fromXywhRect(rect: { x: number, y: number, w: number, h: number }) {
//     //     return this.fromX1y1x2y2(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
//     // }

//     static fromSvgLineElement(svgLine: SVGLineElement) {
//         return new Line(svgLine.x1.baseVal.value, svgLine.y1.baseVal.value, svgLine.x2.baseVal.value, svgLine.y2.baseVal.value);
//     }

//     static fromRect(r: Rect) {
//         // 4 lines
//         return [
//             // top
//             new Line(r.x1, r.y1, r.x2, r.y1),
//             // right
//             new Line(r.x2, r.y1, r.x2, r.y2),
//             // bottom
//             new Line(r.x2, r.y2, r.x1, r.y2),
//             // left
//             new Line(r.x1, r.y2, r.x1, r.y1),
//         ]
//     }

//     intersects(r: Rect | Line): boolean {
//         const swap = this.x1 > this.x2 || this.x1 === this.x2 && this.y2 < this.y1;
//         const x1 = swap ? this.x2 : this.x1;
//         const x2 = swap ? this.x1 : this.x2;
//         const y1 = swap ? this.y2 : this.y1;
//         const y2 = swap ? this.y1 : this.y2;
//         // const x1 = Math.min(this.x1, this.x2)

//         // const x1 = Math.max(this.x1, r.x1);
//         // const x2 = Math.min(this.x2, r.x2);
//         // const y1 = Math.max(this.y1, r.y1);
//         // const y2 = Math.min(this.y2, r.y2);
//         // return x2 >= x1 && y2 >= y1;

//         return (x2 >= r.x1 && x1 <= r.x2) && (y2 >= r.y1 && y1 <= r.y2);
//     }

//     // equals(r: Rect) {
//     //     return r.x1 === this.x1 && r.x2 === this.x2 && r.y1 === this.y1 && r.y2 === this.y2;
//     // }
// }