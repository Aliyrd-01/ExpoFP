import { BoothDrawerBase } from './config-booths-base';
import Color from 'color';
import TriangleDrawer from './TriangleDrawer';

export default class BoothBorderDrawer extends BoothDrawerBase<TriangleDrawer> {

    constructor(booth: Booth) {
        super(booth, 'booth-border', TriangleDrawer);

        if (EFP_EXPO === "vaughanribfest19") return;

        const borderColor = Color("#fff").vec4();
        const r = this.booth.rect;
        const width = __fpBorderWidth;

        let triangles: Triangle[];

        function addTriangles(cx, cy, w, h) {
            triangles.push(...Polygon4.fromRect(Rect.fromCxcywh(cx, cy, w, h)).rotate(booth.rotate, r.cx, r.cy).toTriangles());
        }

        if (booth.paths) triangles = [];
        else {
            triangles = [];

            addTriangles(r.cx, r.cy - r.h / 2, r.w + width, width);
            addTriangles(r.cx, r.cy + r.h / 2, r.w + width, width);
            addTriangles(r.cx - r.w / 2, r.cy, width, r.h + width);
            addTriangles(r.cx + r.w / 2, r.cy, width, r.h + width);
        }

        for (const t of triangles) {
            this.drawer.addObject({
                id: this.getId("border"),
                p0: t[0],
                p1: t[1],
                p2: t[2],
                color: borderColor//Color.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255).vec4()
            });
        }

        this.update();
    }

    update() {
        if (EFP_EXPO === "vaughanribfest19") return;

        const skipDimm = this.getBoothState().skipDim;
        this.drawer.updateSkipdim(this.getId('border'), skipDimm);
    }
}



