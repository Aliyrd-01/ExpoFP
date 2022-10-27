import Color from "color";
import { select } from "d3-selection";
import Rect from "../../../../core/Rect";
import { gtePathByIndex, getLayerSvg } from "../../../../data/svg";
import store from "../../../../store";
import { LayersMode } from "../../../../store/LayerStore";
import { DrawerContext } from "../Drawer1";
import TrianglePainter, { TrianglePainterObject } from "../painters/TrianglePainter";

export default function configBg(context: DrawerContext, layerID: string, painterOrderPriority: number, visible: boolean) {
    let bgPainter: TrianglePainter = null;
    let fgPainter: TrianglePainter = null;
    let drawerSeq = 0;

    var bgElements = select(getLayerSvg(layerID))
        .select(`[data-layer="${layerID}"]`)
        .selectAll(":scope > *:not([data-tagname='efp-booth']):not(g[data-is-editable='false']) path, :scope > path")
        .nodes() as SVGElement[];

    var fgElements = select(getLayerSvg(layerID))
        .select(`[data-layer="${layerID}"]`)
        .selectAll(":scope > g[data-is-editable='false'] path")
        .nodes() as SVGElement[];

    for (const el of bgElements) {
        if (el.tagName === "path") addPath(el as SVGPathElement);
        else if (el.tagName === "rect") addRect(el as SVGRectElement);
    }

    for (const el of fgElements) {
        if (el.tagName === "path") addPath(el as SVGPathElement, true);
        else if (el.tagName === "rect") addRect(el as SVGRectElement, true);
    }

    function addPath(svgPath: SVGPathElement, isFg: boolean = false) {
        if (!svgPath.style.fill) return;
        const d = parseInt(svgPath.getAttribute("data-index"));
        if (svgPath.style.fill === "none") return;
        const color = Color(svgPath.style.fill).vec4();
        const mesh = gtePathByIndex(d, store.layerStore.mode !== LayersMode.Default ? layerID : "");

        // TODO: remove in future versions
        for (const p of mesh.positions) {
            // a bug in svgMesh3d when normalize: false ?
            p[1] = Math.abs(p[1]);
            p.length = 2;
        }

        for (const c of mesh.cells) {
            addObject(
                {
                    p0: mesh.positions[c[0]],
                    p1: mesh.positions[c[1]],
                    p2: mesh.positions[c[2]],
                    color,
                },
                isFg
            );
        }
    }

    function addRect(svgRect: SVGRectElement, isFg: boolean = false) {
        if (!svgRect.style.fill) return;
        const r = Rect.fromSvgRectElement(svgRect);
        const color = Color(svgRect.style.fill).vec4();

        addObject(
            {
                p0: [r.x1, r.y1],
                p1: [r.x2, r.y1],
                p2: [r.x1, r.y2],
                color,
            },
            isFg
        );
        addObject(
            {
                p1: [r.x2, r.y1],
                p2: [r.x1, r.y2],
                p0: [r.x2, r.y2],
                color,
            },
            isFg
        );
    }

    function addObject(item: TrianglePainterObject, isFg: boolean) {
        const suffix = isFg ? "FG" : "BG";
        const priority = isFg ? painterOrderPriority + 5 : painterOrderPriority;

        if (!isFg)
            while (!bgPainter || !bgPainter.tryAddObject(item))
                bgPainter = context.requirePainter(`${layerID}":"${suffix} ${drawerSeq++}`, TrianglePainter, priority, visible);
        else
            while (!fgPainter || !fgPainter.tryAddObject(item))
                fgPainter = context.requirePainter(`${layerID}":"${suffix} ${drawerSeq++}`, TrianglePainter, priority, visible);
    }
}
