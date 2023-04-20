import { getLayerSvg } from "./../../../../data/svg";
import { select } from "d3";
import { reaction } from "mobx";
import { DrawerContext } from "../Drawer1";
import RectPainter from "../painters/RectPainter";
import { CanvasDescriptor, createLabelCanvas } from "./canvases";

let painters: RectPainter[] = [];
let ids: string[] = [];
let edge = 1;
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
            let w = parseFloat(text.getAttribute("data-w"));
            let h = parseFloat(text.getAttribute("data-h"));
            var fontSize = parseFloat(text.getAttribute("font-size")) * 2;

            var fill = "#000000"; // text.style?.fill ?? "#FFFFFF";

            var align = "center";
            if (anchor === "end" && dbl === "auto") {
                align = "rightbottom";
                tx -= w / 2;
                ty -= h / 2;
            }

            addLabel(t, tx, ty, (-1 * r * Math.PI) / 180, align, fontSize, fill);
        }
    });

    function addLabel(text: string, cX: number, cY: number, angle: number, alignment: any, fontSize: number, color: string) {
        let canvas = labelCanvasCache.get(text);
        if (!canvas) {
            canvas = createLabelCanvas(text, fontSize, context.pixelRatio, color, 100);
            labelCanvasCache.set(text, canvas);
        }
        const w = canvas.width / 2;
        const h = canvas.height / 2;

        const p = context.requirePainter(`${layerID}:Sizes`, RectPainter, painterOrderPriority, visible);
        if (painters.indexOf(p) === -1) painters.push(p);

        var id = `${layerID}:${cX}${cY}`;
        ids.push(id);
        p.addObject({
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
                    ids.forEach((id) => {
                        var la = id.substring(0, id.indexOf(":"));
                        painters.find((p) => p.id === `${la}:Sizes`).updateVisible(id, _visible);
                    });
                }
            }
        );
    }
}
