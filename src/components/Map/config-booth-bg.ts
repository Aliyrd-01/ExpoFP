// import Color from "color";
// import settings from "@/settings";
// import BoothDrawerBase from "./BoothDrawerBase";
// // import { getBoothState } from "./config-booths";
// import TriangleDrawer from "./TriangleDrawer";
// import { requireUpdate } from "./draw";

// // let picked = 0;
// export default function configBoothBg(booth: Booth) {
//     // picked++;
//     // if (picked > 1) return null;
//     new BoothBgDrawer(booth);
// }

// class BoothBgDrawer extends BoothDrawerBase<TriangleDrawer> {
//     public readonly updateBound: () => void;
//     private readonly pathsDefaultColors = new Set<string>();

//     constructor(booth: Booth) {
//         super(booth, "booth-bg", TriangleDrawer, 110);

//         // let triangles: Triangle[];

//         if (booth.paths) {
//             // 
//             for (var p of booth.paths) {
//                 // const color = Color(p.color).vec4();
//                 const colored = !!p.color;
//                 if (colored) this.pathsDefaultColors.add(p.color);
//                 for (const t of p.triangles) {
//                     this.drawer.addObject({
//                         id: colored ? this.getId("bg-" + p.color) : this.getId("bg-def"),
//                         groupId: this.getId("bg"),
//                         p0: t[0],
//                         p1: t[1],
//                         p2: t[2],
//                     });
//                 }
//             }
//         }
//         else {
//             const p = Polygon4.fromRect(this.booth.rect).rotate(this.booth.rotate, this.booth.rect.cx, this.booth.rect.cy);
//             const triangles = p.toTriangles();
//             for (const t of triangles) {
//                 this.drawer.addObject({
//                     id: this.getId("bg-def"),
//                     groupId: this.getId("bg"),
//                     p0: t[0],
//                     p1: t[1],
//                     p2: t[2],
//                     // color: Color.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255).vec4()
//                 });
//             }
//         }

//         //const c = getBoothColor(this.booth);
//         // for (const t of triangles) {
//         //     this.drawer.addObject({
//         //         id: this.getId("bg-def"),
//         //         groupId: this.getId("bg"),
//         //         p0: t[0],
//         //         p1: t[1],
//         //         p2: t[2],
//         //         // color: Color.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255).vec4()
//         //     });
//         // }

//         this.update();
//         store.watchBoothState(booth.id, () => requireUpdate(this.updateBound), "hover", "skipDim");
//     }

//     update() {
//         const s = this.getBoothState();
//         const c = this.getBoothColor();
//         this.drawer.updateColor(this.getId("bg-def"), c.vec4());
//         this.drawer.updateSkipdim(this.getId("bg"), s.skipDim);

//         for (const color of Array.from(this.pathsDefaultColors)) {
//             const newColor = this.getBoothPathColor(color);
//             this.drawer.updateColor(this.getId("bg-" + color), newColor.vec4());
//         }
//     }


//     getBoothPathColor(defaultColor: string) {
//         // for white always return white
//         const s = store.getBoothState(this.booth);
//         let colorInfo = Color(defaultColor).hsl();
//         if (colorInfo.lightness() > 90) {
//             return colorInfo;
//         }

//         if (s.selected) {
//             const selColor = Color(settings.colors.booths.selected).hsl();
//             colorInfo = colorInfo.hue(selColor.hue());
//             //colorInfo.hue(selColor.h);
//         } else if (s.hover) {
//             colorInfo = colorInfo.darken(0.1);
//         }

//         return colorInfo;
//     }

//     getBoothColor() {
//         const b = this.booth;
//         const s = this.getBoothState();
//         let color: string;
//         let defColor: any;
//         if (b.special === true) {
//             defColor = b.color || settings.colors.booths.empty;
//         } else if (b.special === false) {
//             defColor =
//                 s.empty && !s.onhold ? b.availColor || settings.colors.booths.empty : b.soldColor || settings.colors.booths.default;
//         }

//         if (s.error) color = "#f33";
//         else if (s.selected) color = settings.colors.booths.selected;
//         else color = defColor;

//         let colorInfo = Color(color);
//         if (s.hover && !s.selected) {
//             const a = colorInfo.alpha();
//             colorInfo = colorInfo.darken(0.2).alpha(a * 1.5);
//         }
//         // var Col = Color;
//         // debugger
//         return colorInfo;
//     }

// }
