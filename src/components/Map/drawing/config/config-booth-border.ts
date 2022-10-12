import Color from "color";
import Polygon4 from "../../../../core/Polygon";
import Rect from "../../../../core/Rect";
import { boothStore } from "../../../../store";
import { Booth } from "../../../../store/BoothStore";
import settings from "../../../../tools/settings";
import { DrawerContext } from "../Drawer1";
import TrianglePainter from "../painters/TrianglePainter";
import BoothDrawerBase from "./BoothDrawerBase";
// import { boothStore } from '../../../../store';

export default function configBoothBorder(
    context: DrawerContext,
    layerID: string,
    booth: Booth,
    painterOrderPriority: number,
    visible: boolean
) {
    // if (EFP_EXPO === "vaughanribfest19") return null;
    if (settings.EXPO === "confex20") return;
    if (booth.paths && !booth.pathsWithRect) return;
    new BoothBorderDrawer(context, layerID, booth, painterOrderPriority, visible);
}

class BoothBorderDrawer extends BoothDrawerBase<TrianglePainter> {
    constructor(context: DrawerContext, layerID: string, booth: Booth, painterOrderPriority: number, visible: boolean) {
        super(context, booth, layerID + "booth-border", TrianglePainter, painterOrderPriority, visible);

        const borderColor = Color(settings.boothBorderColor).vec4();
        const r = this.booth.rect;
        const width = boothStore.borderWidth;

        const triangles: Triangle[] = [];

        function addTriangles(cx, cy, w, h) {
            triangles.push(...Polygon4.fromRect(Rect.fromCxcywh(cx, cy, w, h)).rotate(booth.rotate, r.cx, r.cy).toTriangles());
        }

        addTriangles(r.cx, r.cy - r.h / 2, r.w + width, width);
        addTriangles(r.cx, r.cy + r.h / 2, r.w + width, width);
        addTriangles(r.cx - r.w / 2, r.cy, width, r.h + width);
        addTriangles(r.cx + r.w / 2, r.cy, width, r.h + width);

        for (const t of triangles) {
            this.painter.tryAddObject({
                id: this.getId("border"),
                p0: t[0],
                p1: t[1],
                p2: t[2],
                color: borderColor, //Color.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255).vec4()
            });
        }

        this.startAutoupdate();

        // this.update();
        // if (context.updatable) {
        //     reaction(()=> booth.skipDim, () => context.requireUpdate(this.updateBound));
        // }
    }

    update() {
        const skipDimm = this.booth.skipDim;
        this.painter.updateSkipdim(this.getId("border"), skipDimm);
    }
}
