import Color from "color";
import settings from "@/settings";
import { BoothDrawerBase } from "./config-booths-base";
import { getBoothState } from "./config-booths";
import TriangleDrawer from "./TriangleDrawer";

export default class BoothBgDrawer extends BoothDrawerBase<TriangleDrawer> {

    public readonly updateBound: () => void;

    private readonly pathsDefaultColors = new Set<string>();

    constructor(booth: Booth) {
        super(booth, "booth-bg", TriangleDrawer);

        // let triangles: Triangle[];

        if (booth.paths) {
            // 
            for (var p of booth.paths) {
                // const color = Color(p.color).vec4();
                this.pathsDefaultColors.add(p.color);
                for (const t of p.triangles) {
                    this.drawer.addObject({
                        id: this.getId("bg-" + p.color),
                        groupId: this.getId("bg"),
                        p0: t[0],
                        p1: t[1],
                        p2: t[2],
                    });
                }
            }
        }
        else {
            const p = Polygon4.fromRect(this.booth.rect).rotate(this.booth.rotate, this.booth.rect.cx, this.booth.rect.cy);
            const triangles = p.toTriangles();
            for (const t of triangles) {
                this.drawer.addObject({
                    id: this.getId("bg-rect"),
                    groupId: this.getId("bg"),
                    p0: t[0],
                    p1: t[1],
                    p2: t[2],
                    // color: Color.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255).vec4()
                });
            }
        }

        //const c = getBoothColor(this.booth);
        // for (const t of triangles) {
        //     this.drawer.addObject({
        //         id: this.getId("bg-rect"),
        //         groupId: this.getId("bg"),
        //         p0: t[0],
        //         p1: t[1],
        //         p2: t[2],
        //         // color: Color.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255).vec4()
        //     });
        // }

        this.update();
    }

    update() {
        const s = getBoothState(this.booth);
        const c = getBoothColor(this.booth);
        this.drawer.updateColor(this.getId("bg-rect"), c.vec4());
        this.drawer.updateSkipdim(this.getId("bg"), s.skipDim);

        for (const color of Array.from(this.pathsDefaultColors)) {
            const newColor = getBoothPathColor(this.booth, color);
            this.drawer.updateColor(this.getId("bg-" + color), newColor.vec4());
        }
    }
}

function getBoothPathColor(b: Booth, defaultColor: string) {
    // for white always return white
    // TODO: finish
    const s = getBoothState(b);
    let colorInfo = Color(defaultColor);
    if (colorInfo.hsl().object().l > 90) {
        return colorInfo;
    }
    if (s.selected) {
        colorInfo = colorInfo.darken(0.2);
    } else if (s.hover) {
        colorInfo = colorInfo.darken(0.1);
    }

    return colorInfo;
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
    // var Col = Color;
    // debugger
    return colorInfo;
}
