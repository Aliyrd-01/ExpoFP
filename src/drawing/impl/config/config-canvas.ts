import Color from "color";
import { autorun } from "mobx";
import Polygon4 from "../../../core/Polygon";
import Rect from "../../../core/Rect";
import DrawerImpl from "../DrawerImpl";
import BgPainter from "../painters/BgPainter";

const bgColor = Color("#ebebeb").vec4() as Vec4;
const whiteColor = Color("#fff").vec4() as Vec4;

export default function configCanvas(context: DrawerImpl) {
    const painter = context.requirePainter("canvas", BgPainter, 5);

    function setObjects() {
        const vr = context.canvasVisibleRectPt;
        const cs = context.canvasSizePt;

        function update() {
            const bigTriangles = Polygon4.fromRect(Rect.fromCxcywh(0, 0, 2, 2))
                .toTriangles()
                .flat()
                .flat();
            const bigColors = Array(bigTriangles.length / 2)
                .fill(whiteColor)
                .flat()
                .flat();
            const bigNodims = Array(bigColors.length / 4).fill(1);

            const heightN = (vr.h / cs.height) * 2;
            const widthN = (vr.w / cs.width) * 2;
            const xN = (vr.x1 / cs.width) * 2 - 1;
            const yN = ((cs.height - vr.y2) / cs.height) * 2 - 1;
            const bgRect = Rect.fromXywh(xN, yN, widthN, heightN);

            const bgTriangles = Polygon4.fromRect(bgRect)
                .toTriangles()
                .flat()
                .flat();
            const bgColors = Array(bgTriangles.length / 2)
                .fill(bgColor)
                .flat()
                .flat();
            const bgNodims = Array(bgColors.length / 4).fill(0);

            const allTriangles = [...bigTriangles, ...bgTriangles];
            const allColors = [...bigColors, ...bgColors];
            const allNodims = [...bigNodims, ...bgNodims];

            painter.setObjects(allTriangles, allColors, allNodims);
        }

        context.requireUpdate(update);
        // if (context.updatable) ;
        // else update();
    }

    return autorun(setObjects);
}
