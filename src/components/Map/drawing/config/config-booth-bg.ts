import Color from "color";
import colorInterpolate from "color-interpolate";
import { computed } from "mobx";
import Polygon4 from "../../../../core/Polygon";
import { boothStore } from "../../../../store";
import { Booth, RegularBooth, SpecialBooth } from "../../../../store/BoothStore";
import settings from "../../../../tools/settings";
import { DrawerContext } from "../Drawer1";
// import { getBoothState } from "./config-booths";
import TrianglePainter from "../painters/TrianglePainter";
import BoothDrawerBase from "./BoothDrawerBase";

// let picked = 0;
export default function configBoothBg(context: DrawerContext, booth: Booth) {
    // picked++;
    // if (picked > 1) return null;
    new BoothBgDrawer(context, booth);
}

class BoothBgDrawer extends BoothDrawerBase<TrianglePainter> {
    private readonly pathsDefaultColors: string[];

    constructor(context: DrawerContext, booth: Booth) {
        super(context, booth, "booth-bg", TrianglePainter, 110);

        // let triangles: Triangle[];


        if (!booth.paths || booth.pathsWithRect){
            let rect = this.booth.rect;
            if (settings.borderless) rect = rect.withPadding(boothStore.borderWidth / 2, boothStore.borderWidth / 2);

            const p = Polygon4.fromRect(rect).rotate(this.booth.rotate, this.booth.rect.cx, this.booth.rect.cy);
            const triangles = p.toTriangles();
            for (const t of triangles) {
                this.painter.addObject({
                    id: this.getId("bg-def"),
                    groupId: this.getId("bg"),
                    p0: t[0],
                    p1: t[1],
                    p2: t[2]
                    // color: Color.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255).vec4()
                });
            }
        } 

        if (booth.paths) {
            const pathsColors = new Set<string>();
            for (var p of booth.paths) {
                // const color = Color(p.color).vec4();
                const colored = !!p.color;
                if (colored) pathsColors.add(p.color);
                for (const t of p.triangles) {
                    this.painter.addObject({
                        id: colored ? this.getId("bg-" + p.color) : this.getId("bg-def"),
                        groupId: this.getId("bg"),
                        p0: t[0],
                        p1: t[1],
                        p2: t[2]
                    });
                }
            }
            this.pathsDefaultColors = Array.from(pathsColors);
        } 
        
        
        else {
            let rect = this.booth.rect;
            if (settings.borderless) rect = rect.withPadding(boothStore.borderWidth / 2, boothStore.borderWidth / 2);

            const p = Polygon4.fromRect(rect).rotate(this.booth.rotate, this.booth.rect.cx, this.booth.rect.cy);
            const triangles = p.toTriangles();
            for (const t of triangles) {
                this.painter.addObject({
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
        //     this.drawer.addObject({
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
            const selColor = Color(settings.colors.booths.selected).hsl();
            // console.log('zzz', defaultColor, settings.colors.booths.selected, selColor.hue())
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
            defColor = b.color || settings.colors.booths.empty;
        } else if (b instanceof RegularBooth) {
            defColor =
                b.empty && !b.onHold
                    ? b.availColor || settings.colors.booths.empty
                    : b.soldColor || settings.colors.booths.default;
        }

        if (defColor === "#aaaaaa") defColor = settings.colors.booths.empty;
        return defColor;
    }

    @computed get selectedColorInterpolateFunc() {
        const color0 = "#000";
        const color1 = settings.colors.booths.selected;
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
