import { BoothDrawerBase } from './config-booths-base';
import Color from 'color';
import TriangleDrawer2 from './TriangleDrawer2';

export default class BoothBorderDrawer extends BoothDrawerBase<TriangleDrawer2> {

    // protected readonly drawer: TriangleDrawer2;

    constructor(booth: Booth) {
        super(booth, 'booth-border', TriangleDrawer2);

        const borderColor = Color("#fff").vec4();
        const r = this.booth.rect;
        const width = 0.7;


        // this.drawer.addObject({
        //     id: this.getId("_1"),
        //     rotateRadians: booth.rotate,
        //     center: [r.cx, r.cy],
        //     deltas: [-r.w / 2 - width, -r.h / 2 - width, r.w / 2 + width, -r.h / 2 + width],
        //     deltaPts: [-0, -0, 0, 0],
        //     scalePts: devicePixelRatio,
        //     color: borderColor
        // });
        // this.drawer.addObject({
        //     id: this.getId("_2"),
        //     rotateRadians: booth.rotate,
        //     center: [r.cx, r.cy],
        //     deltas: [-r.w / 2 - width, -r.h / 2 - width, -r.w / 2 + width, r.h / 2 + width],
        //     scalePts: devicePixelRatio,
        //     deltaPts: [-0, -0, 0, 0],
        //     color: borderColor
        // });
        // this.drawer.addObject({
        //     id: this.getId("_3"),
        //     rotateRadians: booth.rotate,
        //     center: [r.cx, r.cy],
        //     deltas: [-r.w / 2 - width, r.h / 2 - width, r.w / 2 + width, r.h / 2 + width],
        //     scalePts: devicePixelRatio,
        //     deltaPts: [-0, -0, 0, 0],
        //     color: borderColor
        // });
        // this.drawer.addObject({
        //     id: this.getId("_4"),
        //     rotateRadians: booth.rotate,
        //     center: [r.cx, r.cy],
        //     deltas: [r.w / 2 - width, -r.h / 2 - width, r.w / 2 + width, r.h / 2 + width],
        //     scalePts: devicePixelRatio,
        //     deltaPts: [-0, -0, 0, 0],
        //     color: borderColor
        // });

        let triangles: Triangle[];

        if (booth.pathTriangles) triangles = booth.borderPathTriangles;
        else {
            triangles = [];
            triangles.push(...Polygon4.fromRect(Rect.fromCxcywh(r.cx, r.cy - r.h / 2, r.w + width, width)).toTriangles());
            triangles.push(...Polygon4.fromRect(Rect.fromCxcywh(r.cx, r.cy + r.h / 2, r.w + width, width)).toTriangles());
            triangles.push(...Polygon4.fromRect(Rect.fromCxcywh(r.cx - r.w / 2, r.cy, width, r.h + width)).toTriangles());
            triangles.push(...Polygon4.fromRect(Rect.fromCxcywh(r.cx + r.w / 2, r.cy, width, r.h + width)).toTriangles());
            }

        for (const t of triangles) {
            this.drawer.addObject({
                p0: t[0],
                p1: t[1],
                p2: t[2],
                color: Color.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255).vec4()
            });
        }



        // this.drawer.addObject({
        //     id: this.getId("_1"),
        //     rotateRadians: booth.rotate,
        //     center: [r.cx, r.cy],
        //     deltas: [-r.w / 2, -r.h / 2, r.w / 2, -r.h / 2],
        //     deltaPts: [-width, -width, width, width],
        //     scalePts: devicePixelRatio,
        //     color: borderColor
        // });
        // this.drawer.addObject({
        //     id: this.getId("_2"),
        //     rotateRadians: booth.rotate,
        //     center: [r.cx, r.cy],
        //     deltas: [-r.w / 2, -r.h / 2, -r.w / 2, r.h / 2],
        //     scalePts: devicePixelRatio,
        //     deltaPts: [-width, -width, width, width],
        //     color: borderColor
        // });
        // this.drawer.addObject({
        //     id: this.getId("_3"),
        //     rotateRadians: booth.rotate,
        //     center: [r.cx, r.cy],
        //     deltas: [-r.w / 2, r.h / 2, r.w / 2, r.h / 2],
        //     scalePts: devicePixelRatio,
        //     deltaPts: [-width, -width, width, width],
        //     color: borderColor
        // });
        // this.drawer.addObject({
        //     id: this.getId("_4"),
        //     rotateRadians: booth.rotate,
        //     center: [r.cx, r.cy],
        //     deltas: [r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
        //     scalePts: devicePixelRatio,
        //     deltaPts: [-width, -width, width, width],
        //     color: borderColor
        // });

        this.update();
    }

    update() {
        const skipDimm = this.getBoothState().skipDim;
        // this.drawer.updateSkipdim(this.getId('_1'), skipDimm);
        // this.drawer.updateSkipdim(this.getId('_2'), skipDimm);
        // this.drawer.updateSkipdim(this.getId('_3'), skipDimm);
        // this.drawer.updateSkipdim(this.getId('_4'), skipDimm);
    }
}



