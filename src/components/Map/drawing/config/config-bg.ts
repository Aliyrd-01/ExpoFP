import Color from "color";
import { select } from "d3-selection";
import Rect from "../../../../core/Rect";
import svg from "../../../../data/svg";
import { DrawerContext } from "../Drawer1";
import TrianglePainter, { TrianglePainterObject } from "../painters/TrianglePainter";

export default function configBg(context: DrawerContext) {
    let drawer: TrianglePainter = null;
    let drawerSeq = 0;
    // const drawer: TrianglePainter = context.requirePainter("bg", TrianglePainter, 10);

    // const color1 = [0, 0, 0, 0.5] as Vec4;
    const bgElements = select(svg)
        .select("#BG")
        .selectAll("path, rect")
        .nodes() as SVGElement[];

    for (const el of bgElements) {
        if (el.tagName === "path") {
            addPath(el as SVGPathElement);
        } else if (el.tagName === "rect") {
            addRect(el as SVGRectElement);
        }
    }

    function addPath(svgPath: SVGPathElement) {
        if (!svgPath.style.fill) return;
        const d = parseInt(svgPath.getAttribute("data-index"));
        const color = Color(svgPath.style.fill).vec4();

        const mesh = __fpPaths[d];

        // TODO: remove in future versions
        for (const p of mesh.positions) {
            // a bug in svgMesh3d when normalize: false ?
            p[1] = Math.abs(p[1]);
            p.length = 2;
        }

        for (const c of mesh.cells) {
            
            addObject({
                p0: mesh.positions[c[0]],
                p1: mesh.positions[c[1]],
                p2: mesh.positions[c[2]],
                color
            });
        }
    }

    function addRect(svgRect: SVGRectElement) {
        if (!svgRect.style.fill) return;
        const r = Rect.fromSvgRectElement(svgRect);
        const color = Color(svgRect.style.fill).vec4();

        addObject({
            p0: [r.x1, r.y1],
            p1: [r.x2, r.y1],
            p2: [r.x1, r.y2],
            color
        });
        addObject({
            p1: [r.x2, r.y1],
            p2: [r.x1, r.y2],
            p0: [r.x2, r.y2],
            color
        });
    }

    function addObject(item: TrianglePainterObject) {
        while (!drawer || !drawer.tryAddObject(item)) {
            drawer = context.requirePainter("bg" + drawerSeq++, TrianglePainter, 10);            
        }
    }

    // drawer.alpha = 1;
    //animate(600, 300, d3.easeLinear, d3.interpolateNumber(0, 1), v => drawer.alpha = v);

    // drawer.alpha = 0.5;
}



declare  const __fp: string;
declare const __fpPaths: { [id: string]: any };