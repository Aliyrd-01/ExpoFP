import { getLayerSvg } from "./../../../../data/svg";
import { select } from "d3";
import { reaction } from "mobx";
import { DrawerContext } from "../Drawer1";
import RectPainter, { TexPosition } from "../painters/RectPainter";
import { CanvasDescriptor, createCircleCanvas, createLabelCanvas } from "./canvases";

let edge = 1.3;
let _visible = true;

const ids: string[] = [];
let painter: RectPainter;

export default function configSizes(context: DrawerContext, layerID: string, painterOrderPriority: number, visible: boolean) {
    const labelCanvasCache = new Map<string, CanvasDescriptor>();

    (select(getLayerSvg(layerID)).selectAll("text").nodes() as SVGTextElement[]).forEach((text) => {
        const transform = text.getAttribute("transform");
        const mt = transform.match(/translate\(([-0-9.]+) ([-0-9.]+)\)( rotate\(([-0-9.]+)\))?/);

        if (mt) {
            var t = text.innerHTML;
            let tx = parseFloat(mt[1]);
            let ty = parseFloat(mt[2]);
            const r = parseFloat(mt[4]) || 0;

            var anchor = text.getAttribute("text-anchor");
            var dbl = text.getAttribute("dominant-baseline");
            var fontSize = parseFloat(text.getAttribute("font-size"));

            var fill = "#000000"; // text.style?.fill ?? "#FFFFFF";

            var align: TexPosition;
            if (anchor === "end" && dbl === "auto") align = "rightbottom";
            else if (anchor === "start" && dbl === "middle") align = "leftcenter";
            else if (anchor === "end" && dbl === "middle") align = "rightcenter";
            else if (anchor === "middle" && dbl === "auto") align = "centerbottom";
            else if (anchor === "middle" && dbl === "hanging") align = "centertop";

            addLabel(t, tx, ty, (-1 * r * Math.PI) / 180, align, fontSize, fill);
        }
    });

    function addLabel(
        text: string,
        cX: number,
        cY: number,
        angle: number,
        alignment: TexPosition,
        fontSize: number,
        color: string
    ) {
        let canvas = labelCanvasCache.get(text);
        if (!canvas) {
            canvas = createLabelCanvas(text, fontSize, 1, color, 200);
            labelCanvasCache.set(text, canvas);
        }
        const w = canvas.width;
        const h = canvas.height;

        painter = context.requirePainter(`Sizes:${layerID}`, RectPainter, painterOrderPriority, visible);
        _visible = visible;

        var deltas: Vec4;
        if (alignment == "rightbottom") deltas = [-w, -h, 0, 0];
        // else if (alignment == "leftcenter") deltas = [0, -h / 2, w, h / 2];
        // else if (alignment == "rightcenter") deltas = [-w, -h / 2, 0, h / 2];
        // else if (alignment == "centerbottom") deltas = [-w / 2, -h, w / 2, 0];
        // else if (alignment == "centertop") deltas = [-w / 2, 0, w / 2, h];
        else {
            deltas = [-w / 2, -h / 2, w / 2, h / 2];
            alignment = "center";
        }

        var id = `${layerID}:${cX}${cY}`;
        ids.push(id);

        painter.addObject({
            id: id,
            rotateRadians: angle,
            center: [cX, cY],
            deltas: [0, 0, 0, 0],
            deltaPts: deltas,
            canvasTmp: canvas,
            texPosition: alignment,
            visible: false,
        });

        const s = 2;
        var circle = createCircleCanvas(s, context.pixelRatio, "#777");
        var idr = id + "_r";
        ids.push(idr);

        painter.addObject({
            id: idr,
            center: [cX, cY],
            deltaPts: [-s, -s, s, s],
            canvasTmp: circle,
            texPosition: alignment,
            visible: visible,
        });
    }

    if (context.updatable) {
        reaction(
            () => context.ptscale,
            () => {
                if ((context.ptscale > edge && _visible) || (context.ptscale < edge && !_visible)) {
                    _visible = !_visible;

                    ids.forEach((id) => {
                        if (id.endsWith("_r")) painter.updateVisible(id, !_visible);
                        else painter.updateVisible(id, _visible);
                    });
                }
            }
        );
    }
}
