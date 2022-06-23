import { getLayerSvg } from "./../../../../data/svg";
import { select } from "d3";
import { reaction } from "mobx";
import { DrawerContext } from "../Drawer1";
import RectPainter from "../painters/RectPainter";
import { CanvasDescriptor, createLabelCanvas } from "./canvases";

export default function configSizes(context: DrawerContext, layerID: string, painterOrderPriority: number, visible: boolean) {
    let painter: RectPainter = null;
    let ids: string[] = [];
    let _visible = true;
    let edge = 0.5;

    const labelCanvasCache = new Map<string, CanvasDescriptor>();

    (select(getLayerSvg(layerID)).selectAll("text").nodes() as SVGImageElement[]).forEach((text) => {
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
            if (anchor === "end" && dbl === "auto") {
                align = "rightbottom";
                tx -= w / 2;
                ty -= h / 2;
            }

            addLabel(t, tx, ty, (-1 * r * Math.PI) / 180, align);
        }
    });

    function addLabel(text: string, cX: number, cY: number, angle: number, alignment: any, fontSize: number = 18) {
        let canvas = labelCanvasCache.get(text);
        if (!canvas) {
            canvas = createLabelCanvas(text, fontSize, context.pixelRatio, "#FFFFFF");
            labelCanvasCache.set(text, canvas);
        }
        const w = canvas.width / 2;
        const h = canvas.height / 2;

        if (!painter) painter = context.requirePainter(`${layerID}:`, RectPainter, painterOrderPriority, visible);

        var id = `${cX}${cY}`;
        ids.push(id);
        painter.addObject({
            id: id,
            rotateRadians: angle,
            center: [cX, cY],
            deltas: [0, 0, 0, 0],
            deltaPts: [-w, -h, w, h],
            canvasTmp: canvas,
            texPosition: alignment,
            visible: _visible,
        });
    }

    if (context.updatable) {
        reaction(
            () => context.ptscale,
            () => {
                if ((context.ptscale > edge && _visible) || (context.ptscale < edge && !_visible)) {
                    _visible = !_visible;
                    ids.forEach((id) => painter.updateVisible(id, _visible));
                }
            }
        );
    }
}
