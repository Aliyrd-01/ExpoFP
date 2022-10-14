import Color from "color";
import colorInterpolate from "color-interpolate";
import { computed } from "mobx";
import Polygon4 from "../../../../core/Polygon";
import store, { boothStore } from "../../../../store";
import { Booth, RegularBooth, SpecialBooth } from "../../../../store/BoothStore";
import { LayersMode } from "../../../../store/LayerStore";
import settings from "../../../../tools/settings";
import { DrawerContext } from "../Drawer1";
// import { getBoothState } from "./config-booths";
import TrianglePainter, { TrianglePainterObject } from "../painters/TrianglePainter";
import { gtePathByIndex } from "./../../../../data/svg";
import { BoothDrawerBaseWithoutPainter } from "./BoothDrawerBase";

// let picked = 0;
export default function configBoothBg(
    context: DrawerContext,
    layerID: string,
    booth: Booth,
    painterOrderPriority: number,
    visible: boolean
) {
    // picked++;
    // if (picked > 1) return null;
    new BoothBgDrawer(context, layerID, booth, painterOrderPriority, visible);
}

let seq = 0;

class BoothBgDrawer extends BoothDrawerBaseWithoutPainter {
    private readonly pathsDefaultColors: string[];
    private readonly painters: TrianglePainter[] = [];

    constructor(context: DrawerContext, layerID: string, booth: Booth, painterOrderPriority: number, visible: boolean) {
        super(context, booth);

        // let triangles: Triangle[];

        if (!booth.paths || booth.pathsWithRect) {
            let rect = this.booth.rect;
            //if (settings.borderless)
            rect = rect.withPadding(boothStore.borderWidth / 2, boothStore.borderWidth / 2);

            const p = Polygon4.fromRect(rect).rotate(this.booth.rotate, this.booth.rect.cx, this.booth.rect.cy);
            const triangles = p.toTriangles();
            for (const t of triangles) {
                this.addObject(
                    layerID,
                    {
                        id: this.getId("bg-def"),
                        groupId: this.getId("bg"),
                        p0: t[0],
                        p1: t[1],
                        p2: t[2],
                        // color: Color.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255).vec4()
                    },
                    painterOrderPriority,
                    visible
                );
            }
        }

        if (booth.paths) {
            const pathsColors = new Set<string>();
            for (var p of booth.paths) {
                // const color = Color(p.color).vec4();
                const colored = !!p.color;
                if (colored) pathsColors.add(p.color);
                for (const t of getTrianglesFromFpPaths(
                    p.index,
                    store.layerStore.mode !== LayersMode.Default ? booth.layer.name : ""
                )) {
                    this.addObject(
                        layerID,
                        {
                            id: colored ? this.getId("bg-" + p.color) : this.getId("bg-def"),
                            groupId: this.getId("bg"),
                            p0: t[0],
                            p1: t[1],
                            p2: t[2],
                        },
                        painterOrderPriority,
                        visible
                    );
                }
            }
            this.pathsDefaultColors = Array.from(pathsColors);
        } else {
            let rect = this.booth.rect;
            //if (!settings.borderless)
            rect = rect.withPadding(boothStore.borderWidth / 2, boothStore.borderWidth / 2);

            const p = Polygon4.fromRect(rect).rotate(this.booth.rotate, this.booth.rect.cx, this.booth.rect.cy);
            const triangles = p.toTriangles();
            for (const t of triangles) {
                this.addObject(
                    layerID,
                    {
                        id: this.getId("bg-def"),
                        groupId: this.getId("bg"),
                        p0: t[0],
                        p1: t[1],
                        p2: t[2],
                        // color: Color.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255).vec4()
                    },
                    painterOrderPriority,
                    visible
                );
            }
        }

        this.startAutoupdate();
    }

    addObject(layerID: string, item: TrianglePainterObject, painterOrderPriority: number, visible: boolean) {
        let painter = this.context.requirePainter(layerID + "booth-bg" + seq, TrianglePainter, painterOrderPriority, visible);
        while (!painter || !painter.tryAddObject(item)) {
            painter = this.context.requirePainter(layerID + "booth-bg" + ++seq, TrianglePainter, painterOrderPriority, visible);
        }

        if (this.painters.indexOf(painter) === -1) this.painters.push(painter);
    }

    update() {
        const s = this.booth; //this.getBoothState();
        const c = this.getBoothColor();

        this.painters.forEach((p) => p.updateColor(this.getId("bg-def"), c.vec4()));
        this.painters.forEach((p) => p.updateSkipdim(this.getId("bg"), s.skipDim));

        for (const color of this.pathsDefaultColors || []) {
            const newColor = this.getBoothPathColor(color);
            this.painters.forEach((p) => p.updateColor(this.getId("bg-" + color), newColor.vec4()));
        }
    }

    getBoothPathColor(defaultColor: string) {
        // for white always return white
        const s = this.booth; //store.getBoothState(this.booth);
        let colorInfo = Color(defaultColor).hsl();
        let lightness = colorInfo.lightness();
        if (lightness > 90 || lightness < 30) return colorInfo;

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
            const settingsColors = settings.colors.booths;
            if (b.onHold) {
                defColor = b.holdColor || b.soldColor || settingsColors.default;
            } else if (b.exhibitors.length || b.reserved) {
                defColor = b.soldColor || settingsColors.default;
            } else {
                defColor = b.availColor || settingsColors.empty;
            }
        }

        //if (defColor === "#aaaaaa") defColor = settings.colors.booths.empty;
        if (defColor === "#666" || defColor === "#666666") defColor = "rgba(0,0,0,0.172)";
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

function getTrianglesFromFpPaths(index: number, suffix: string) {
    const mesh = gtePathByIndex(index, suffix);
    // TODO: remove in future versions
    for (const p of mesh.positions) {
        // a bug in svgMesh3d when normalize: false ?
        p[1] = Math.abs(p[1]);
        p.length = 2;
    }
    const pathTriangles = [];
    for (const c of mesh.cells) {
        pathTriangles.push([mesh.positions[c[0]], mesh.positions[c[1]], mesh.positions[c[2]]]);
    }

    return pathTriangles;
}
