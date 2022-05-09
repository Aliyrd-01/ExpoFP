import { select } from "d3";
import { reaction } from "mobx";
import svg from "../../../../data/svg";
import { DrawerContext } from "../Drawer1";
import RectPainter from "../painters/RectPainter";
import { createLabelCanvas } from "./canvases";

export default function configSizes(context: DrawerContext, painterOrderPriority: number) {
    let painter: RectPainter = null;
    let ids: string[] = [];
    let visible = true;
    let edge = 0.5;

    (select(svg).selectAll("text").nodes() as SVGImageElement[]).forEach((text) => {
        const transform = text.getAttribute("transform");
        const mt = transform.match(/translate\(([-0-9.]+) ([-0-9.]+)\)( rotate\(([-0-9.]+)\))?/);
        if (mt) {
            var t = text.innerHTML;
            let tx = parseFloat(mt[1]);
            let ty = parseFloat(mt[2]);
            const r = parseFloat(mt[4]) || 0;

            var anchor = text.getAttribute("text-anchor");
            var dbl = text.getAttribute("dominant-baseline");
            let w = parseFloat(text.getAttribute("data-w"));
            let h = parseFloat(text.getAttribute("data-h"));

            var align = "center";
            if (anchor == "end" && dbl == "text-bottom") {
                align = "center"; //"rightbottom";
                tx -= 10;
                ty -= 5;
            }

            addLabel(t, tx, ty, (-1 * r * Math.PI) / 180, align);
        }
    });

    function addLabel(text: string, cX: number, cY: number, angle: number, alignment: any, fontSize: number = 18) {
        const canvas = createLabelCanvas(text, fontSize, context.pixelRatio, "#FFFFFF");
        const w = canvas.width;
        const h = canvas.height;

        if (!painter) painter = context.requirePainter(`sizes`, RectPainter, painterOrderPriority);

        var id = `${cX}${cY}`;
        ids.push(id);
        painter.addObject({
            id: id,
            rotateRadians: angle,
            center: [cX, cY],
            deltas: [0, 0, 0, 0],
            deltaPts: [-w / 2, -h / 2, w / 2, h / 2],
            canvasTmp: canvas,
            texPosition: alignment,
            visible,
        });
    }

    if (context.updatable) {
        reaction(
            () => context.ptscale,
            () => {
                if ((context.ptscale > edge && visible) || (context.ptscale < edge && !visible)) {
                    visible = !visible;
                    ids.forEach((id) => painter.updateVisible(id, visible));
                }
            }
        );
    }
}
