import { DrawerContext } from "../Drawer1";
import BgPainter from "../painters/BgPainter";
import settings from "../../../../tools/settings";
import Color from "color";
import Rect from "../../../../core/Rect";
import Polygon4 from "../../../../core/Polygon";

const bgColor = Color(settings.colors.base).vec4();

export default function configCanvas(context: DrawerContext) {
    const painter = context.requirePainter("canvas", BgPainter, 5);

    function setObjects() {
        const triangles = Polygon4.fromRect(Rect.fromCxcywh(0, 0, 2, 2))
            .toTriangles()
            .flat()
            .flat();
        const colors = Array(6).fill(bgColor).flat().flat();

        context.
        
        // [...bgColor, ...bgColor, ...bgColor, ...bgColor, ...bgColor, ...bgColor];
        painter.setObjects(triangles, colors);
    }

    setObjects();
}
