import Color from "color";
import settings from "@/settings";
import { BoothDrawerBase } from "./config-booths-base";
import { getBoothState } from "./config-booths";
import TriangleDrawer from "./TriangleDrawer";

export default class BoothBgDrawer extends BoothDrawerBase<TriangleDrawer> {

    public readonly updateBound: () => void;

    constructor(booth: Booth) {
        super(booth, "booth-bg", TriangleDrawer);

        let triangles: Triangle[];

        if (booth.pathTriangles) triangles = booth.pathTriangles;
        else {
            const p = Polygon4.fromRect(this.booth.rect).rotate(this.booth.rotate, this.booth.rect.cx, this.booth.rect.cy);
            triangles = p.toTriangles();
        }

        const c = getBoothColor(this.booth);
        for (const t of triangles) {
            this.drawer.addObject({
                id: this.getId("bg"),
                p0: t[0],
                p1: t[1],
                p2: t[2],
                // color: Color.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255).vec4()
            });
        }

        this.update();
    }

    update() {
        const s = getBoothState(this.booth);
        const c = getBoothColor(this.booth);
        this.drawer.updateColor(this.getId("bg"), c.vec4());
        this.drawer.updateSkipdim(this.getId("bg"), s.skipDim);
    }
}

function getBoothColor(b: Booth) {
    const s = getBoothState(b);
    let color: string;
    let defColor: any;
    if (b.special === true) {
        defColor = b.color;
    } else if (b.special === false) {
        defColor =
            s.empty && !s.onhold ? b.availColor || settings.colors.booths.empty : b.soldColor || settings.colors.booths.default;
    }

    if (s.error) color = "#f33";
    else if (s.selected) color = settings.colors.booths.selected;
    else color = defColor;

    let colorInfo = Color(color);
    if (s.hover && !s.selected) {
        colorInfo = colorInfo.darken(0.2);
    }

    return colorInfo;
}
