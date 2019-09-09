import Color from "color";
import colorInterpolate from "color-interpolate";
import { computed } from "mobx";
import Polygon4 from "../../../../core/Polygon";
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
        } else {
            const p = Polygon4.fromRect(this.booth.rect).rotate(this.booth.rotate, this.booth.rect.cx, this.booth.rect.cy);
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

        // let animateProp:any;

        // animateProp(t=>this.selectedAnimationPart = t, 1000)

        // reaction(
        //     () => booth.selected,
        //     () => {
        //         if (booth.selected) {
        //             let animationStart = performance.now();
        //             let animationLength = 1000; // 1 sec

        //             const drawFrame = () => {
        //                 if (!booth.selected) return;
        //                 const now = performance.now();
        //                 const part = (now - animationStart) % (animationLength * 2);
        //                 // part will be 0 - 1999.(9)
        //                 const partN = part - 1000;
        //                 // partN is -1000 to 999.(9)
        //                 const tN = partN / 1000;
        //                 // tN = [-1, 1)
        //                 const t = 1 - Math.abs(tN);
        //                 // t = [0, 1]
        //                 this.selectedAnimationPart = t;
        //                 window.requestAnimationFrame(drawFrame);
        //             };
        //             drawFrame();
        //         } else {
        //             this.selectedAnimationPart = 0;
        //         }
        //     },
        //     { fireImmediately: true }
        // );

        // autorun(this.runAnimation);
    }

    // @computed({ keepAlive: true }) get boothColor() {
    //     return null;
    // }

    update() {
        // console.log('autorun2a')

        const s = this.booth; //this.getBoothState();
        const c = this.getBoothColor();

        //console.log('update', s.name, s.hover)
        this.painter.updateColor(this.getId("bg-def"), c.vec4());
        this.painter.updateSkipdim(this.getId("bg"), s.skipDim);

        for (const color of this.pathsDefaultColors || []) {
            const newColor = this.getBoothPathColor(color);
            this.painter.updateColor(this.getId("bg-" + color), newColor.vec4());
        }
    }

    // private toggleAnimation(enabled: boolean) {
    //     if (enabled) {
    //     }
    // }

    // private runAnimation() {
    //     // if (!this.booth.selected)

    //     // returns dispose function
    //     let animationStart = performance.now();
    //     let animationLength = 1000; // 1 sec
    //     const that = this;
    //     // let t;

    //     let animationFrameId: number;

    //     function drawFrame() {
    //         const now = performance.now();
    //         const part = (now - animationStart) % (animationLength * 2);
    //         // part will be 0 - 1999.(9)
    //         const partN = part - 1000;
    //         // partN is -1000 to 999.(9)
    //         const tN = partN / 1000;
    //         // tN = [-1, 1)
    //         const t = 1 - Math.abs(tN);
    //         // t = [0, 1]
    //         that.selectedAnimationPart = t;
    //         animationFrameId = window.requestAnimationFrame(drawFrame);
    //     }

    //     drawFrame();

    //     return () => window.cancelAnimationFrame(animationFrameId);
    // }

    // @observable private selectedAnimationPart = 0;

    // private animationRunning = false;

    // ensureSelectedAnimation() {
    //     const b = this.booth;
    //     if (b.selected && !this.animationRunning) {
    //         this.animationRunning = true;

    //         // TODO see how to use easing funcs
    //         // continue or start animation
    //     } else if (!b.selected && this.animationRunning) {
    //         // stop animating
    //     }
    // }

    getBoothPathColor(defaultColor: string) {
        // for white always return white
        const s = this.booth; //store.getBoothState(this.booth);
        let colorInfo = Color(defaultColor).hsl();
        if (colorInfo.lightness() > 90) {
            return colorInfo;
        }

        // this.ensureSelectedAnimation();

        if (s.selected) {
            const selColor = Color(settings.colors.booths.selected).hsl();
            colorInfo = colorInfo.hue(selColor.hue());
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

    // private currentSelectedAnimationCancel: () => void;

    getBoothColor() {
        const b = this.booth;

        let color: string;
        if (b.error) color = "#f33";
        else if (b.selected) {
            const color0 = settings.colors.booths.selected;
            const color1 = "#fb3e59";
            const c = colorInterpolate([color0, color1]);
            color = c(this.shape.selectBgAnimationPart);
        } else color = this.defaultColor;

        let colorInfo = Color(color);
        if (b.hover && !b.selected) {
            const a = colorInfo.alpha();
            colorInfo = colorInfo.darken(0.2).alpha(a * 1.5);
        }

        return colorInfo;
    }
}
