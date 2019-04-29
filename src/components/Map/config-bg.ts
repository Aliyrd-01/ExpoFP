import Color from 'color';
import { requireDrawer, requireUpdate } from "./draw";
import TriangleDrawer2 from "./TriangleDrawer2";
import settings from '@/settings';
import svg from '@/tools/svg'
import animate from './animate';
// import svgMesh3d from 'svg-mesh-3d';

export default function configBg() {
    const drawer = requireDrawer('bg', TriangleDrawer2);

    // const color1 = [0, 0, 0, 0.5] as Vec4;
    const bgElements = (d3.select(svg).select('#BG').selectAll('path, rect').nodes() as SVGElement[]);

    for (const el of bgElements) {
        if (el.tagName === "path") {
            addPath(el as SVGPathElement);
        } else if (el.tagName === "rect") {
            addRect(el as SVGRectElement);
        }
    }

    // for (const p of paths) {
    //     addPath(p);
    // }

    // const rects = (d3.select(svg).select('#BG').selectAll('rect').nodes() as SVGRectElement[]);

    // // const color = ColorInfo.fromHex(settings.colors.bg).toVec4();
    // for (const ro of rects) {
    //     addRect(ro);

    // }

    function addPath(svgPath: SVGPathElement) {
        const d = parseInt(svgPath.getAttribute('data-index'));
        const color = Color(svgPath.style.fill).vec4();

        const mesh = __fpPaths[d];
        //var mesh = svgMesh3d(d, { normalize: false, scale: 8 });
        for (const p of mesh.positions) {
            // a bug in svgMesh3d when normalize: false ?
            p[1] = -p[1];
            p.length = 2;
        }
        for (const c of mesh.cells) {

            drawer.addObject({
                p0: mesh.positions[c[0]],
                p1: mesh.positions[c[1]],
                p2: mesh.positions[c[2]],
                color
            });

        }
    }

    function addRect(svgRect: SVGRectElement) {
        const r = Rect.fromSvgRectElement(svgRect);
        const color = Color(svgRect.style.fill).vec4();

        drawer.addObject({
            p0: [r.x1, r.y1],
            p1: [r.x2, r.y1],
            p2: [r.x1, r.y2],
            color
        });
        drawer.addObject({
            p1: [r.x2, r.y1],
            p2: [r.x1, r.y2],
            p0: [r.x2, r.y2],
            color
        });
    }

    // drawer.alpha = 1;
    //animate(600, 300, d3.easeLinear, d3.interpolateNumber(0, 1), v => drawer.alpha = v);

    // drawer.alpha = 0.5;
};





