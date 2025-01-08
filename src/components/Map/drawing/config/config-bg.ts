import Color from "color";
import { select } from "d3-selection";
import Rect from "../../../../core/Rect";
import { getLayerSvg, gtePathByIndex } from "../../../../data/svg";
import store, { uiState } from "../../../../store";
import { Layer, LayersMode } from "../../../../store/LayerStore";
import { DrawerContext } from "../Drawer1";
import TrianglePainter, { TrianglePainterObject } from "../painters/TrianglePainter";

export default async function configBg(
    context: DrawerContext,
    layer: Layer,
    painterOrderPriority: number,
    visible: boolean
): Promise<void> {
    let bgPainter: TrianglePainter = null;
    let fgPainter: TrianglePainter = null;
    let drawerSeq = 0;

    const selected = select(getLayerSvg(layer)).select(`[data-layer="${layer.name}"]`);

    const bgElements = selected
        .selectAll(":scope > *:not([data-tagname='efp-booth']):not(g[data-is-editable='false']) path, :scope > path")
        .nodes() as SVGElement[];

    const fgElements = selected
        .selectAll(
            ":scope g[data-layer] > g[data-is-editable='false'] path, :scope > g[data-is-editable='false'] path, :scope > path[data-tagname='ptext']"
        )
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
        const color = uiState.monochrome ? Color(svgPath.style.fill).grayscale().vec4() : Color(svgPath.style.fill).vec4();
        const mesh = gtePathByIndex(d, store.layerStore.mode !== LayersMode.Default ? layer.rootParent?.name || layer.name : "");

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
        const suffix = isFg ? "_FG" : "_BG";
        const priority = isFg ? painterOrderPriority + 7 : painterOrderPriority;

        if (!isFg)
            while (!bgPainter || !bgPainter.tryAddObject(item))
                bgPainter = context.requirePainter(`${layer.name}:${suffix}${drawerSeq++}`, TrianglePainter, priority, visible);
        else
            while (!fgPainter || !fgPainter.tryAddObject(item))
                fgPainter = context.requirePainter(`${layer.name}:${suffix}${drawerSeq++}`, TrianglePainter, priority, visible);
    }
}
