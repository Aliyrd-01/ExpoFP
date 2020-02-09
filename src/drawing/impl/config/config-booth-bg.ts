import Color from "color";
import colorInterpolate from "color-interpolate";
import { computed } from "mobx";
import { Booth, RegularBooth, SpecialBooth } from "../../../core/Booth";
import Polygon4 from "../../../core/Polygon";
import DrawerImpl from "../DrawerImpl";
// import Polygon4 from "../../../../core/Polygon";
// import { boothStore } from "../../../../store";
// import { Booth, RegularBooth, SpecialBooth } from "../../../../store/BoothStore";
// import settings from "../../../../tools/settings";
// import { DrawerContext } from "../Drawer1";
// import { getBoothState } from "./config-booths";
import TrianglePainter from "../painters/TrianglePainter";
import BoothDrawerBase from "./BoothDrawerBase";
import { meshToTrianglePainterObjects } from "./util";

const COLOR_DEFAULT = "#41b6e7";
const COLOR_SELECTED = "#fb3e59";
const COLOR_EMPTY = "rgba(0,0,0,0.205)";

// let picked = 0;
export default function configBoothBg(context: DrawerImpl, booth: Booth) {
    // picked++;
    // if (picked > 1) return null;
    const dr = new BoothBgDrawer(context, booth);
    return dr.dispose.bind(dr);
}

class BoothBgDrawer extends BoothDrawerBase<TrianglePainter> {
    private readonly pathsDefaultColors: string[];

    constructor(context: DrawerImpl, booth: Booth) {
        super(context, booth, "booth-bg", TrianglePainter, 110);

        const borderWidth = context.config.borderWidth;

        if (!booth.paths || booth.pathsWithRect) {
            let rect = this.booth.rect;
            //if (settings.borderless)
            rect = rect.withPadding(borderWidth / 2, borderWidth / 2);

            const p = Polygon4.fromRect(rect).rotate(this.booth.rotate, this.booth.rect.cx, this.booth.rect.cy);
            const triangles = p.toTriangles();
            for (const t of triangles) {
                this.painter.tryAddObject({
                    id: this.getId("bg-def"),
                    groupId: this.getId("bg"),
                    p0: t[0],
                    p1: t[1],
                    p2: t[2]
                    // color: Color.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255).vec4()
                });
            }
            // if (booth.pathsWithRect) debugger
        }

        if (booth.paths) {
            const pathsColors = new Set<string>();
            for (var p of booth.paths) {
                // const color = Color(p.color).vec4();
                const colored = !!p.fill;
                if (colored) pathsColors.add(p.fill);
                const triangles = meshToTrianglePainterObjects(context.config.mesh[p.meshIndex]);
                // if (triangles.length === 0) debugger
                for (const t of triangles) {
                    t.id = colored ? this.getId("bg-" + p.fill) : this.getId("bg-def");
                    t.groupId = this.getId("bg");
                    this.painter.tryAddObject(t);
                    // this.painter.tryAddObject({
                    //     id: colored ? this.getId("bg-" + p.fill) : this.getId("bg-def"),
                    //     groupId: this.getId("bg"),
                    //     p0: t[0],
                    //     p1: t[1],
                    //     p2: t[2]
                    // });
                }
            }
            this.pathsDefaultColors = Array.from(pathsColors);
        } else {
            let rect = this.booth.rect;
            // if (borderWidth === 0) rect = rect.withPadding(borderWidth / 2, borderWidth / 2);

            const p = Polygon4.fromRect(rect).rotate(this.booth.rotate, this.booth.rect.cx, this.booth.rect.cy);
            const triangles = p.toTriangles();
            for (const t of triangles) {
                this.painter.tryAddObject({
                    id: this.getId("bg-def"),
                    groupId: this.getId("bg"),
                    p0: t[0],
                    p1: t[1],
                    p2: t[2]
                    // color: Color.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255).vec4()
                });
            }
        }

        //const c = getBoothColor(this.booth);
        // for (const t of triangles) {
        //     this.drawer.tryAddObject({
        //         id: this.getId("bg-def"),
        //         groupId: this.getId("bg"),
        //         p0: t[0],
        //         p1: t[1],
        //         p2: t[2],
        //         // color: Color.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255).vec4()
        //     });
        // }

        // this.update();

        // if (context.updatable) {
        //     reaction(() => [booth.hover, booth.skipDim, booth.selected], () => context.requireUpdate(this.updateBound));
        //     // store.watchBoothState(booth.id, () => context.requireUpdate(this.updateBound), "hover", "skipDim");
        // }
        this.startAutoupdate();
    }

    update() {
        const s = this.booth; //this.getBoothState();
        const c = this.getBoothColor();

        this.painter.updateColor(this.getId("bg-def"), c.vec4());
        this.painter.updateSkipdim(this.getId("bg"), s.skipDim);

        for (const color of this.pathsDefaultColors || []) {
            const newColor = this.getBoothPathColor(color);
            this.painter.updateColor(this.getId("bg-" + color), newColor.vec4());
        }
    }

    getBoothPathColor(defaultColor: string) {
        // for white always return white
        const s = this.booth; //store.getBoothState(this.booth);
        let colorInfo = Color(defaultColor).hsl();
        if (colorInfo.lightness() > 90) {
            return colorInfo;
        }

        if (s.selected) {
            const selColor = Color(COLOR_SELECTED).hsl();
            // console.log('zzz', defaultColor, COLOR_SELECTED, selColor.hue())
            const startLightness = selColor.lightness();
            const curLightness = startLightness * this.shape.selectBgAnimationPart;

            colorInfo = colorInfo.hue(selColor.hue()).lightness(curLightness);
            // console.log("zzz", colorInfo);

            // colorInfo = Color('#000');
            //colorInfo.hue(selColor.h);
        } else if (s.hover) {
            colorInfo = colorInfo.darken(0.1);
        }

        return colorInfo;
    }

    @computed({ keepAlive: true }) get defaultColor() {
        const b = this.booth;
        let defColor: string;
        if (b instanceof SpecialBooth) {
            defColor = b.color || COLOR_EMPTY;
        } else if (b instanceof RegularBooth) {
            // const settingsColors = settings.colors.booths;
            if (b.onHold) {
                defColor = b.holdColor || b.soldColor || COLOR_DEFAULT;
            } else if (b.exhibitorIds.length || b.reserved) {
                defColor = b.soldColor || COLOR_DEFAULT;
            } else {
                defColor = b.availColor || COLOR_EMPTY;
            }
        }

        if (defColor === "#aaaaaa") defColor = COLOR_EMPTY;
        else if (defColor === "#666" || defColor === "#666666") defColor = "rgba(0,0,0,0.172)";
        return defColor;
    }

    @computed get selectedColorInterpolateFunc() {
        const color0 = "#000";
        const color1 = COLOR_SELECTED;
        return colorInterpolate([color0, color1]);
    }

    getBoothColor() {
        const b = this.booth;

        let color: string;
        if (b.error) color = "#f33";
        else if (b.selected) {
            color = this.selectedColorInterpolateFunc(this.shape.selectBgAnimationPart);
        } else color = this.defaultColor;

        let colorInfo = Color(color);
        if (b.hover && !b.selected) {
            const a = colorInfo.alpha();
            colorInfo = colorInfo.darken(0.2).alpha(a * 1.5);
        }

        return colorInfo;
    }
}
