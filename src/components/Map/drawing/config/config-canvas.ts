import { DrawerContext } from "../Drawer1";
import BgPainter from "../painters/BgPainter";
import settings from "../../../../tools/settings";
import Color from "color";

const bgColor = Color(settings.colors.base).vec4();

export default function configCanvas(context: DrawerContext) {
    const painter = context.requirePainter("canvas", BgPainter, 5);

    const triangles = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
    const colors = [...bgColor, ...bgColor, ...bgColor, ...bgColor, ...bgColor, ...bgColor];
    painter.setObjects(triangles, colors);
}
