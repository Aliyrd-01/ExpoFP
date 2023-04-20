import { boothStore } from "./../../../../store/index";
import { getLayerSvg } from "./../../../../data/svg";
import { select } from "d3";
import { reaction } from "mobx";
import { DrawerContext } from "../Drawer1";
import RectPainter, { TexPosition } from "../painters/RectPainter";
import { CanvasDescriptor, createLabelCanvas } from "./canvases";

let painters: RectPainter[] = [];
let ids: string[] = [];
let edge = 1.2;
let _visible = true;

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
            var fontSize = 8 * boothStore.borderWidth;

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
            canvas = createLabelCanvas(text, fontSize, context.pixelRatio, color, 200);
            labelCanvasCache.set(text, canvas);
        }
        const w = canvas.width;
        const h = canvas.height;

        const p = context.requirePainter(`${layerID}:Sizes`, RectPainter, painterOrderPriority, visible);
        if (painters.indexOf(p) === -1) painters.push(p);

        var deltas: Vec4;
        if (alignment == "rightbottom") deltas = [-w, -h, 0, 0];
        else if (alignment == "leftcenter") deltas = [0, -h / 2, w, h / 2];
        else if (alignment == "rightcenter") deltas = [-w, -h / 2, 0, h / 2];
        else if (alignment == "centerbottom") deltas = [-w / 2, -h, w / 2, 0];
        else if (alignment == "centertop") deltas = [-w / 2, 0, w / 2, h];

        var id = `${layerID}:${cX}${cY}`;
        ids.push(id);
        p.addObject({
            id: id,
            rotateRadians: angle,
            center: [cX, cY],
            deltas: [0, 0, 0, 0],
            deltaPts: deltas,
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
                    ids.forEach((id) => {
                        var la = id.substring(0, id.indexOf(":"));
                        painters.find((p) => p.id === `${la}:Sizes`).updateVisible(id, _visible);
                    });
                }
            }
        );
    }
}
